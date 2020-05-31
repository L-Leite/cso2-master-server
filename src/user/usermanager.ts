import net from 'net'
import superagent from 'superagent'

import { ExtendedSocket } from 'extendedsocket'

import { Channel } from 'channel/channel'
import { Room, RoomTeamNum } from 'room/room'

import { User } from 'user/user'
import { UserInventory } from 'user/userinventory'
import { UserSession } from 'user/usersession'

import { ChannelManager } from 'channel/channelmanager'

import { ChatMessageType } from 'packets/definitions'
import { FavoritePacketType } from 'packets/definitions'
import { HostPacketType } from 'packets/definitions'
import { OptionPacketType } from 'packets/definitions'

import { InFavoritePacket } from 'packets/in/favorite'
import { InFavoriteSetCosmetics } from 'packets/in/favorite/setcosmetics'
import { InFavoriteSetLoadout } from 'packets/in/favorite/setloadout'
import { InHostPacket } from 'packets/in/host'
import { InHostItemUsing } from 'packets/in/host/itemusing'
import { InHostSetBuyMenu } from 'packets/in/host/setbuymenu'
import { InHostSetInventory } from 'packets/in/host/setinventory'
import { InHostSetLoadout } from 'packets/in/host/setloadout'
import { InHostTeamChanging } from 'packets/in/host/teamchanging'
import { InLoginPacket } from 'packets/in/login'
import { InOptionPacket } from 'packets/in/option'
import { InOptionBuyMenu } from 'packets/in/option/buymenu'

import { OutChatPacket } from 'packets/out/chat'
import { OutFavoritePacket } from 'packets/out/favorite'
import { OutHostPacket } from 'packets/out/host'
import { OutInventoryPacket } from 'packets/out/inventory'
import { OutOptionPacket } from 'packets/out/option'
import { OutUserInfoPacket } from 'packets/out/userinfo'
import { OutUserStartPacket } from 'packets/out/userstart'

import { userSvcAuthority, UserSvcPing } from 'authorities'

import { AboutMeHandler } from 'handlers/aboutmehandler'

import { UserService } from 'services/userservice'
import { ActiveConnections } from 'storage/activeconnections'

import {
    GAME_LOGIN_BAD_PASSWORD,
    GAME_LOGIN_BAD_USERNAME,
    GAME_LOGIN_INVALID_USERINFO,
} from 'gamestrings'

// TODO: move this to UserManager, make UserManager not static
const userService = new UserService(userSvcAuthority())
const aboutMeHandler = new AboutMeHandler(userService)

/**
 * handles the user logic
 */
export class UserManager {
    public static async OnSocketClosed(conn: ExtendedSocket): Promise<void> {
        const session: UserSession = conn.session

        if (session == null) {
            return
        }

        const curChannel: Channel = session.currentChannel

        if (curChannel != null) {
            curChannel.OnUserLeft(conn)
        }

        await userService.Logout(session.user.userId)
    }

    /**
     * validate an user's credentials
     * @param username the user's name
     * @param password the user's password
     * @return a promise with the logged in user's ID, or zero if failed
     */
    public static async validateCredentials(username: string, password: string): Promise<number> {
        try {
            const res: superagent.Response = await superagent
                .post(userSvcAuthority() + '/users/check')
                .send({
                    username,
                    password,
                })
                .accept('json')
            return res.status === 200 ? res.body.userId : 0
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
            return 0
        }
    }

    /**
     * called when we receive a login request packet
     * @param loginData the login packet's data
     * @param connection the login requester's connection
     * @param server the instance to the server
     */
    public static async onLoginPacket(loginData: Buffer, connection: ExtendedSocket,
                                      holepunchPort: number): Promise<boolean> {
        const loginPacket: InLoginPacket = new InLoginPacket(loginData)

        const loggedUserId = await userService.Login(loginPacket.gameUsername, loginPacket.password)

        if (loggedUserId === 0) {
            this.SendUserDialogBox(connection, GAME_LOGIN_BAD_USERNAME)

            console.warn('Could not create session for user %s', loginPacket.gameUsername)
            return false
        }

        if (loggedUserId === -1) {
            this.SendUserDialogBox(connection, GAME_LOGIN_BAD_PASSWORD)

            console.warn(`Login attempt for user ${loginPacket.gameUsername} failed`)
            return false
        }

        // clear plain password right away, we don't need it anymore
        loginPacket.password = null

        const user: User = await userService.GetUserById(loggedUserId)

        if (user == null) {
            this.SendUserDialogBox(connection, GAME_LOGIN_INVALID_USERINFO)

            console.error('Couldn\'t get user ID %i\' information', loggedUserId)
            return false
        }

        const newSession: UserSession = new UserSession(user, connection.address() as net.AddressInfo)
        connection.session = newSession

        console.log(`user ${user.userName} logged in (uuid: ${connection.uuid})`)

        ActiveConnections.Singleton().Add(connection)

        UserManager.sendUserInfoToSelf(user, connection, holepunchPort)
        UserManager.sendInventory(newSession.user.userId, connection)
        ChannelManager.sendChannelListTo(connection)

        return true
    }

    /**
     * handles the incoming host packets
     * @param packetData the host's packet data
     * @param connection the client's socket
     */
    public static async onHostPacket(packetData: Buffer, connection: ExtendedSocket): Promise<boolean> {
        const hostPacket: InHostPacket = new InHostPacket(packetData)

        const session: UserSession = connection.session

        if (session == null) {
            console.error(`couldn't get session from connection ${connection.uuid}`)
            return false
        }

        switch (hostPacket.packetType) {
            case HostPacketType.OnGameEnd:
                return this.onHostGameEnd(connection)
            case HostPacketType.SetInventory:
                return this.onHostSetUserInventory(hostPacket, connection)
            case HostPacketType.SetLoadout:
                return this.onHostSetUserLoadout(hostPacket, connection)
            case HostPacketType.SetBuyMenu:
                return this.onHostSetUserBuyMenu(hostPacket, connection)
            case HostPacketType.TeamChanging:
                return this.onTeamChangingRequest(packetData, connection)
            case HostPacketType.ItemUsing:
                return this.onItemUsing(hostPacket, connection)
        }

        console.warn('UserManager::onHostPacket: unknown host packet type %i',
            hostPacket.packetType)

        return false
    }

    public static onItemUsing(hostPacket: InHostPacket, userConn: ExtendedSocket): boolean {
        const itemData: InHostItemUsing = new InHostItemUsing(hostPacket)

        const targetConn: ExtendedSocket = ActiveConnections.Singleton().FindByOwnerId(itemData.userId)

        const requesterSession: UserSession = userConn.session
        const targetSession: UserSession = targetConn.session

        if (requesterSession == null) {
            console.warn(`Could not get user ID's ${itemData.userId} session`)
            return false
        }

        if (requesterSession.isInRoom() === false) {
            console.warn(`User ID ${requesterSession.user.userId} tried to send someone's team chaning request without being in a room`)
            return false
        }

        if (targetSession == null) {
            console.warn(`User ID ${requesterSession.user.userId} tried to send someone's team changing request with user ID ${itemData.userId} whose session is null`)
            return false
        }

        const currentRoom: Room = requesterSession.currentRoom

        if (currentRoom == null) {
            console.error(`Tried to get user's ${requesterSession.user.userId}
room but it couldn't be found.`)
            return false
        }

        if (currentRoom.host.userId !== requesterSession.user.userId) {
            console.warn(`User ID ${requesterSession.user.userId} sent User ID ${targetSession.user.userId}'s team changing request without being the room's host. Real host ID: ${currentRoom.host.userId} room "${currentRoom.settings.roomName}" (id ${currentRoom.id})`)
            return false
        }

        userConn.send(OutHostPacket.itemUse(itemData.userId, itemData.itemId))

        console.log('Sending user ID %i\'s item %i using request to host ID %i, room %s (room id %i)',
        requesterSession.user.userId, itemData.itemId,
        currentRoom.host.userId, currentRoom.settings.roomName, currentRoom.id)

        return true;
    }

    public static onTeamChangingRequest(packetData: Buffer, userConn: ExtendedSocket): boolean {
        const teamData = new InHostTeamChanging(packetData)

        const targetConn: ExtendedSocket = ActiveConnections.Singleton().FindByOwnerId(teamData.userId)

        const requesterSession: UserSession = userConn.session
        const targetSession: UserSession = targetConn.session

        if (requesterSession == null) {
            console.warn(`Could not get user ID's ${teamData.userId} session`)
            return false
        }

        if (requesterSession.isInRoom() === false) {
            console.warn(`User ID ${requesterSession.user.userId} tried to send someone's team chaning request without being in a room`)
            return false
        }

        if (targetSession == null) {
            console.warn(`User ID ${requesterSession.user.userId} tried to send someone's team changing request with user ID ${teamData.userId} whose session is null`)
            return false
        }

        const currentRoom: Room = requesterSession.currentRoom

        if (currentRoom == null) {
            console.error(`Tried to get user's ${requesterSession.user.userId}
room but it couldn't be found.`)
            return false
        }

        if (currentRoom.host.userId !== requesterSession.user.userId) {
            console.warn(`User ID ${requesterSession.user.userId} sent User ID ${targetSession.user.userId}'s team changing request without being the room's host. Real host ID: ${currentRoom.host.userId} room "${currentRoom.settings.roomName}" (id ${currentRoom.id})`)
            return false
        }

        if (teamData.newTeam !== RoomTeamNum.Terrorist && teamData.newTeam !== RoomTeamNum.CounterTerrorist) {
            console.warn(`User Id ${targetSession.user.userId} tried to change his team, but the value ${teamData.newTeam} is not allowed.`)
            return false
        }

        currentRoom.updateUserTeam(targetSession.user.userId, teamData.newTeam)

        console.log('Automatic changing User ID %i\'s team to the %i in room %s (host ID %i, room id %i)',
        requesterSession.user.userId, teamData.newTeam,
        currentRoom.settings.roomName, currentRoom.host.userId, currentRoom.id)

        return true
    }

    public static async onHostSetUserInventory(hostPacket: InHostPacket, userConn: ExtendedSocket): Promise<boolean> {
        const preloadData: InHostSetInventory = new InHostSetInventory(hostPacket)

        const targetConn: ExtendedSocket = ActiveConnections.Singleton().FindByOwnerId(preloadData.userId)

        const requesterSession: UserSession = userConn.session
        const targetSession: UserSession = targetConn.session

        if (requesterSession == null) {
            console.warn(`Could not get user ID's ${preloadData.userId} session`)
            return false
        }

        if (requesterSession.isInRoom() === false) {
            console.warn(`User ID ${requesterSession.user.userId} tried to send its inventory without being in a room`)
            return false
        }

        if (targetSession == null) {
            console.warn(`User ID ${requesterSession.user.userId} tried to send
its inventory to user ID ${preloadData.userId} whose session is null`)
            return false
        }

        const currentRoom: Room = requesterSession.currentRoom

        if (currentRoom == null) {
            console.error(`Tried to get user's ${requesterSession.user.userId}
room but it couldn't be found.`)
            return false
        }

        if (currentRoom.host.userId !== requesterSession.user.userId) {
            console.warn(
                `User ID ${requesterSession.user.userId} sent an user's inventory request without being the room's host.
Real host ID: ${currentRoom.host.userId} room "${currentRoom.settings.roomName}" (id ${currentRoom.id})`)
            return false
        }

        await this.sendUserInventoryTo(requesterSession.user.userId, userConn, targetSession.user.userId)

        console.log(`Sending user ID ${preloadData.userId}'s inventory to host ID ${currentRoom.host.userId},
 room ${currentRoom.settings.roomName} (room id ${currentRoom.id})`)

        return true
    }

    public static async onHostSetUserLoadout(hostPacket: InHostPacket,
                                             sourceConn: ExtendedSocket): Promise<boolean> {
        const loadoutData: InHostSetLoadout = new InHostSetLoadout(hostPacket)

        const targetConn: ExtendedSocket = ActiveConnections.Singleton().FindByOwnerId(loadoutData.userId)

        const requesterSession: UserSession = sourceConn.session
        const targetSession: UserSession = targetConn.session

        if (requesterSession == null) {
            console.warn('Could not get user ID\'s %i session', loadoutData.userId)
            return false
        }

        if (requesterSession.isInRoom() === false) {
            console.warn('User ID %i tried to send loadout without being in a room', requesterSession.user.userId)
            return false
        }

        if (targetSession == null) {
            console.warn('User ID %i tried to send its loadout to user ID %i whose session is null',
                requesterSession.user.userId, loadoutData.userId)
            return false
        }

        const currentRoom: Room = requesterSession.currentRoom

        if (currentRoom == null) {
            console.error('Tried to get user\'s %i room but it couldn\'t be found.',
                requesterSession.user.userId)
            return false
        }

        if (currentRoom.host.userId !== requesterSession.user.userId) {
            console.warn('User ID %i sent an user\'s loadout request without being the room\'s host.'
                + 'Real host ID: %i room "%s" (id %i)',
                requesterSession.user.userId, currentRoom.host.userId, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        await this.sendUserLoadoutTo(sourceConn, targetSession.user.userId)

        console.log('Sending user ID %i\'s loadout to host ID %i, room %s (room id %i)',
            requesterSession.user.userId, currentRoom.host.userId, currentRoom.settings.roomName, currentRoom.id)

        return true
    }

    public static async onHostSetUserBuyMenu(hostPacket: InHostPacket, sourceConn: ExtendedSocket): Promise<boolean> {
        const buyMenuData: InHostSetBuyMenu = new InHostSetBuyMenu(hostPacket)

        const targetConn: ExtendedSocket = ActiveConnections.Singleton().FindByOwnerId(buyMenuData.userId)

        const requesterSession: UserSession = sourceConn.session
        const targetSession: UserSession = targetConn.session

        if (requesterSession == null) {
            console.warn('Could not get user ID\'s %i session', buyMenuData.userId)
            return false
        }

        if (requesterSession.isInRoom() === false) {
            console.warn('User ID %i tried to send buy menu without being in a room', requesterSession.user.userId)
            return false
        }

        if (targetSession == null) {
            console.warn('User ID %i tried to send its buy menu to user ID %i whose session is null',
                requesterSession.user.userId, buyMenuData.userId)
            return false
        }

        const currentRoom: Room = requesterSession.currentRoom

        if (currentRoom == null) {
            console.error('Tried to get user\'s %i room but it couldn\'t be found.',
                requesterSession.user.userId)
            return false
        }

        if (currentRoom.host.userId !== requesterSession.user.userId) {
            console.warn('User ID %i sent an user\'s buy menu request without being the room\'s host.'
                + 'Real host ID: %i room "%s" (id %i)',
                requesterSession.user.userId, currentRoom.host.userId, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        await this.sendUserBuyMenuTo(sourceConn, targetSession.user.userId)

        console.log('Sending user ID %i\'s buy menu to host ID %i, room %s (room id %i)',
            requesterSession.user.userId, currentRoom.host.userId, currentRoom.settings.roomName, currentRoom.id)

        return true
    }

    public static async onAboutmePacket(packetData: Buffer, connection: ExtendedSocket): Promise<boolean> {
        return await aboutMeHandler.OnPacket(packetData, connection)
    }

    /**
     * listens for option packets
     * @param optionData the packet's data
     * @param conn the sender's connection
     */
    public static async onOptionPacket(optionData: Buffer, conn: ExtendedSocket): Promise<boolean> {
        if (conn.session == null) {
            console.warn(`connection ${conn.uuid} sent an option packet without a session`)
            return false
        }

        const optPacket: InOptionPacket = new InOptionPacket(optionData)

        switch (optPacket.packetType) {
            case OptionPacketType.SetBuyMenu:
                return this.onOptionSetBuyMenu(optPacket, conn)
        }

        console.warn('UserManager::onOptionPacket: unknown packet type %i',
            optPacket.packetType)

        return false
    }

    public static async onOptionSetBuyMenu(optPacket: InOptionPacket,
                                           conn: ExtendedSocket): Promise<boolean> {
        const buyMenuData: InOptionBuyMenu = new InOptionBuyMenu(optPacket)

        const session: UserSession = conn.session

        if (session == null) {
            console.warn(`Could not get connection "${conn.uuid}"'s session`)
            return false
        }

        console.log(`Setting user ID ${session.user.userId}'s buy menu`)

        await UserInventory.setBuyMenu(session.user.userId, buyMenuData.buyMenu)

        return true
    }

    public static async onFavoritePacket(favoriteData: Buffer, sourceConn: ExtendedSocket): Promise<boolean> {
        if (sourceConn.session == null) {
            console.warn(`connection ${sourceConn.uuid} sent a favorite packet without a session`)
            return false
        }

        const favPacket: InFavoritePacket = new InFavoritePacket(favoriteData)

        switch (favPacket.packetType) {
            case FavoritePacketType.SetLoadout:
                return this.onFavoriteSetLoadout(favPacket, sourceConn)
            case FavoritePacketType.SetCosmetics:
                return this.onFavoriteSetCosmetics(favPacket, sourceConn)
        }

        console.warn('UserManager::onFavoritePacket: unknown packet type %i',
            favPacket.packetType)

        return false
    }

    public static async onFavoriteSetLoadout(favPacket: InFavoritePacket,
                                             sourceConn: ExtendedSocket): Promise<boolean> {
        const loadoutData: InFavoriteSetLoadout = new InFavoriteSetLoadout(favPacket)

        const session: UserSession = sourceConn.session

        if (session == null) {
            console.warn(`Could not get connection "${sourceConn.uuid}"'s session`)
            return false
        }

        const loadoutNum: number = loadoutData.loadout
        const slot: number = loadoutData.weaponSlot
        const itemId: number = loadoutData.itemId

        console.log(
            `Setting user ID ${session.user.userId}'s new weapon ${itemId} to slot ${slot} in loadout ${loadoutNum}`)

        await UserInventory.setLoadoutWeapon(session.user.userId, loadoutNum, slot, itemId)

        return true
    }

    public static async onFavoriteSetCosmetics(favPacket: InFavoritePacket,
                                               sourceConn: ExtendedSocket): Promise<boolean> {
        const cosmeticsData: InFavoriteSetCosmetics = new InFavoriteSetCosmetics(favPacket)

        const session: UserSession = sourceConn.session

        if (session == null) {
            console.warn(`Could not get connection "${sourceConn.uuid}"'s session`)
            return false
        }

        const slot: number = cosmeticsData.slot
        const itemId: number = cosmeticsData.itemId

        console.log('Setting user ID %i\'s new cosmetic %i to slot %i',
            session.user.userId, itemId, slot)

        await UserInventory.setCosmeticSlot(session.user.userId, slot, itemId)

        return true
    }

    public static onHostGameEnd(userConn: ExtendedSocket): boolean {
        const session: UserSession = userConn.session

        if (session == null) {
            console.warn(`Could not get connection "${userConn.uuid}"'s session`)
            return false
        }

        if (session.isInRoom() === false) {
            console.warn('User ID %i tried to end a match without being in a room', session.user.userId)
            return false
        }

        const currentRoom: Room = session.currentRoom

        if (currentRoom == null) {
            console.error('Tried to get user\'s %i room but it couldn\'t be found. room id: %i',
                session.user.userId, currentRoom.id)
            return false
        }

        console.log('Ending game for room "%s" (room id %i)',
            currentRoom.settings.roomName, currentRoom.id)

        currentRoom.endGame()

        return true
    }

    /**
     * send an user's info to itself
     * @param user the target user's object
     * @param conn the target user's connection
     * @param holepunchPort the master server's UDP holepunching port
     */
    private static async sendUserInfoToSelf(user: User, conn: ExtendedSocket, holepunchPort: number): Promise<void> {
        conn.send(new OutUserStartPacket(user.userId, user.userName, user.playerName, holepunchPort))
        conn.send(OutUserInfoPacket.fullUserUpdate(user))
    }

    /**
     * sends an user's inventory to itself
     * @param userId the target user's ID
     * @param conn the target user's connection
     */
    private static async sendInventory(userId: number, conn: ExtendedSocket): Promise<void> {
        const [inventory, cosmetics, loadouts, buyMenu] = await Promise.all([
            UserInventory.getInventory(userId),
            UserInventory.getCosmetics(userId),
            UserInventory.getAllLoadouts(userId),
            UserInventory.getBuyMenu(userId),
        ])

        if (inventory == null || cosmetics == null
            || loadouts == null || buyMenu == null) {
            return
        }

        conn.send(OutInventoryPacket.createInventory(inventory.items))
        /*const defaultInvReply: Buffer =
            new OutInventoryPacket(conn).addInventory(inventory.getDefaultInventory())
        conn.send(defaultInvReply)*/

        // TO BE REVERSED
        const unlockReply: Buffer = Buffer.from([0x55, 0x19, 0x5F, 0x05, 0x5A, 0x01, 0x4B, 0x00, 0x01, 0x00, 0x00,
            0x00, 0x0B, 0x00, 0x00, 0x00, 0x01, 0xE8, 0x03, 0x00, 0x00, 0x09, 0x00, 0x00, 0x00, 0x0C, 0x00,
            0x00, 0x00, 0x01, 0xDC, 0x05, 0x00, 0x00, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x00, 0x00, 0x00, 0x01,
            0xE8, 0x03, 0x00, 0x00, 0x18, 0x00, 0x00, 0x00, 0x0E, 0x00, 0x00, 0x00, 0x01, 0xDC, 0x05, 0x00,
            0x00, 0x0B, 0x00, 0x00, 0x00, 0x0F, 0x00, 0x00, 0x00, 0x01, 0x08, 0x07, 0x00, 0x00, 0x3C, 0x00,
            0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x01, 0x80, 0xBB, 0x00, 0x00, 0x1F, 0x00, 0x00, 0x00, 0x11,
            0x00, 0x00, 0x00, 0x01, 0xC0, 0x5D, 0x00, 0x00, 0x11, 0x00, 0x00, 0x00, 0x12, 0x00, 0x00, 0x00,
            0x01, 0x08, 0x07, 0x00, 0x00, 0x1C, 0x00, 0x00, 0x00, 0x13, 0x00, 0x00, 0x00, 0x01, 0x4C, 0x1D,
            0x00, 0x00, 0x3B, 0x00, 0x00, 0x00, 0x14, 0x00, 0x00, 0x00, 0x01, 0x60, 0x61, 0x02, 0x00, 0x35,
            0x00, 0x00, 0x00, 0x15, 0x00, 0x00, 0x00, 0x01, 0x30, 0x75, 0x00, 0x00, 0x1A, 0x00, 0x00, 0x00,
            0x16, 0x00, 0x00, 0x00, 0x01, 0xA0, 0x0F, 0x00, 0x00, 0x19, 0x00, 0x00, 0x00, 0x17, 0x00, 0x00,
            0x00, 0x01, 0x98, 0x3A, 0x00, 0x00, 0x3F, 0x00, 0x00, 0x00, 0x18, 0x00, 0x00, 0x00, 0x01, 0xE0,
            0x93, 0x04, 0x00, 0x14, 0x00, 0x00, 0x00, 0x19, 0x00, 0x00, 0x00, 0x01, 0xA0, 0x0F, 0x00, 0x00,
            0x07, 0x00, 0x00, 0x00, 0x1A, 0x00, 0x00, 0x00, 0x01, 0x98, 0x3A, 0x00, 0x00, 0x3E, 0x00, 0x00,
            0x00, 0x1B, 0x00, 0x00, 0x00, 0x01, 0xE0, 0x93, 0x04, 0x00, 0x05, 0x00, 0x00, 0x00, 0x1C, 0x00,
            0x00, 0x00, 0x01, 0x08, 0x07, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x1D, 0x00, 0x00, 0x00, 0x01,
            0x30, 0x75, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x1E, 0x00, 0x00, 0x00, 0x01, 0x88, 0x13, 0x00,
            0x00, 0x0C, 0x00, 0x00, 0x00, 0x1F, 0x00, 0x00, 0x00, 0x01, 0x20, 0x4E, 0x00, 0x00, 0x16, 0x00,
            0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x01, 0x20, 0x4E, 0x00, 0x00, 0x34, 0x00, 0x00, 0x00, 0x43,
            0x00, 0x00, 0x00, 0x01, 0x30, 0x75, 0x00, 0x00, 0x46, 0x00, 0x00, 0x00, 0x57, 0x00, 0x00, 0x00,
            0x01, 0x20, 0xA1, 0x07, 0x00, 0x47, 0x00, 0x00, 0x00, 0x58, 0x00, 0x00, 0x00, 0x01, 0x20, 0xA1,
            0x07, 0x00, 0x4D, 0x00, 0x00, 0x00, 0x59, 0x00, 0x00, 0x00, 0x00, 0x90, 0x01, 0x00, 0x00, 0x55,
            0x00, 0x00, 0x00, 0x81, 0x00, 0x00, 0x00, 0x00, 0x70, 0x03, 0x00, 0x00, 0x30, 0x00, 0x00, 0x00,
            0x90, 0x00, 0x00, 0x00, 0x01, 0x30, 0x75, 0x00, 0x00, 0x1D, 0x00, 0x00, 0x00, 0x91, 0x00, 0x00,
            0x00, 0x01, 0x60, 0xEA, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x92, 0x00, 0x00, 0x00, 0x01, 0x48,
            0xE8, 0x01, 0x00, 0x2F, 0x00, 0x00, 0x00, 0x93, 0x00, 0x00, 0x00, 0x01, 0x40, 0x0D, 0x03, 0x00,
            0x6A, 0xBF, 0x00, 0x00, 0xA8, 0x00, 0x00, 0x00, 0x00, 0x28, 0x00, 0x00, 0x00, 0x70, 0xBF, 0x00,
            0x00, 0xA9, 0x00, 0x00, 0x00, 0x00, 0x50, 0x00, 0x00, 0x00, 0x6F, 0xBF, 0x00, 0x00, 0xAA, 0x00,
            0x00, 0x00, 0x00, 0x28, 0x00, 0x00, 0x00, 0x6E, 0xBF, 0x00, 0x00, 0xAB, 0x00, 0x00, 0x00, 0x00,
            0x50, 0x00, 0x00, 0x00, 0x69, 0xBF, 0x00, 0x00, 0xAC, 0x00, 0x00, 0x00, 0x00, 0x28, 0x00, 0x00,
            0x00, 0x72, 0xBF, 0x00, 0x00, 0xAD, 0x00, 0x00, 0x00, 0x00, 0x50, 0x00, 0x00, 0x00, 0x6B, 0xBF,
            0x00, 0x00, 0xAE, 0x00, 0x00, 0x00, 0x00, 0x28, 0x00, 0x00, 0x00, 0x6D, 0xBF, 0x00, 0x00, 0xAF,
            0x00, 0x00, 0x00, 0x00, 0x50, 0x00, 0x00, 0x00, 0x4A, 0x00, 0x00, 0x00, 0xD7, 0x00, 0x00, 0x00,
            0x01, 0x50, 0xC3, 0x00, 0x00, 0x4B, 0x00, 0x00, 0x00, 0xD8, 0x00, 0x00, 0x00, 0x01, 0x00, 0x77,
            0x01, 0x00, 0x4E, 0x00, 0x00, 0x00, 0xE8, 0x00, 0x00, 0x00, 0x01, 0x70, 0x11, 0x01, 0x00, 0x52,
            0x00, 0x00, 0x00, 0xE9, 0x00, 0x00, 0x00, 0x01, 0xC0, 0xD4, 0x01, 0x00, 0x5B, 0x00, 0x00, 0x00,
            0x06, 0x01, 0x00, 0x00, 0x01, 0xF0, 0x49, 0x02, 0x00, 0x5F, 0x00, 0x00, 0x00, 0x19, 0x01, 0x00,
            0x00, 0x01, 0x60, 0xEA, 0x00, 0x00, 0x60, 0x00, 0x00, 0x00, 0x1A, 0x01, 0x00, 0x00, 0x01, 0xC0,
            0xD4, 0x01, 0x00, 0x64, 0x00, 0x00, 0x00, 0x38, 0x01, 0x00, 0x00, 0x01, 0xF0, 0x49, 0x02, 0x00,
            0x68, 0x00, 0x00, 0x00, 0x5C, 0x01, 0x00, 0x00, 0x01, 0x20, 0xA1, 0x07, 0x00, 0x6D, 0x00, 0x00,
            0x00, 0x82, 0x01, 0x00, 0x00, 0x01, 0xA0, 0x86, 0x01, 0x00, 0x6C, 0x00, 0x00, 0x00, 0x83, 0x01,
            0x00, 0x00, 0x01, 0xA0, 0x86, 0x01, 0x00, 0x6E, 0x00, 0x00, 0x00, 0x84, 0x01, 0x00, 0x00, 0x01,
            0xA0, 0x86, 0x01, 0x00, 0x42, 0x00, 0x00, 0x00, 0xFA, 0x01, 0x00, 0x00, 0x01, 0x30, 0x75, 0x00,
            0x00, 0x43, 0x00, 0x00, 0x00, 0xFB, 0x01, 0x00, 0x00, 0x01, 0x50, 0xC3, 0x00, 0x00, 0x78, 0x00,
            0x00, 0x00, 0xFC, 0x01, 0x00, 0x00, 0x01, 0x40, 0x0D, 0x03, 0x00, 0x79, 0x00, 0x00, 0x00, 0x07,
            0x02, 0x00, 0x00, 0x00, 0xA0, 0x00, 0x00, 0x00, 0x7C, 0x00, 0x00, 0x00, 0x08, 0x02, 0x00, 0x00,
            0x00, 0x04, 0x01, 0x00, 0x00, 0x7A, 0x00, 0x00, 0x00, 0x09, 0x02, 0x00, 0x00, 0x00, 0xE0, 0x01,
            0x00, 0x00, 0x7B, 0x00, 0x00, 0x00, 0x0A, 0x02, 0x00, 0x00, 0x00, 0x44, 0x02, 0x00, 0x00, 0x7D,
            0x00, 0x00, 0x00, 0x58, 0x02, 0x00, 0x00, 0x00, 0x44, 0x02, 0x00, 0x00, 0x7E, 0x00, 0x00, 0x00,
            0x59, 0x02, 0x00, 0x00, 0x00, 0x0C, 0x03, 0x00, 0x00, 0x81, 0x00, 0x00, 0x00, 0x91, 0x02, 0x00,
            0x00, 0x01, 0xF0, 0x49, 0x02, 0x00, 0x82, 0x00, 0x00, 0x00, 0x92, 0x02, 0x00, 0x00, 0x01, 0x00,
            0x53, 0x07, 0x00, 0x83, 0x00, 0x00, 0x00, 0x93, 0x02, 0x00, 0x00, 0x01, 0x60, 0x5B, 0x03, 0x00,
            0x85, 0x00, 0x00, 0x00, 0x94, 0x02, 0x00, 0x00, 0x00, 0x40, 0x01, 0x00, 0x00, 0x84, 0x00, 0x00,
            0x00, 0x95, 0x02, 0x00, 0x00, 0x00, 0x08, 0x02, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x1F, 0x03,
            0x00, 0x00, 0x00, 0x08, 0x02, 0x00, 0x00, 0x8A, 0x00, 0x00, 0x00, 0xA4, 0x03, 0x00, 0x00, 0x01,
            0xE0, 0x93, 0x04, 0x00, 0x8F, 0x00, 0x00, 0x00, 0x44, 0x04, 0x00, 0x00, 0x01, 0x80, 0xA9, 0x03,
            0x00, 0x90, 0x00, 0x00, 0x00, 0x45, 0x04, 0x00, 0x00, 0x01, 0x40, 0x7E, 0x05, 0x00, 0x91, 0x00,
            0x00, 0x00, 0x46, 0x04, 0x00, 0x00, 0x01, 0x00, 0x53, 0x07, 0x00, 0x9B, 0x00, 0x00, 0x00, 0xA9,
            0x04, 0x00, 0x00, 0x01, 0xF0, 0x49, 0x02, 0x00, 0x9C, 0x00, 0x00, 0x00, 0xAA, 0x04, 0x00, 0x00,
            0x01, 0x40, 0x0D, 0x03, 0x00, 0x97, 0x00, 0x00, 0x00, 0xFC, 0x04, 0x00, 0x00, 0x01, 0x42, 0x99,
            0x00, 0x00, 0x98, 0x00, 0x00, 0x00, 0xFD, 0x04, 0x00, 0x00, 0x01, 0x86, 0x29, 0x02, 0x00, 0x99,
            0x00, 0x00, 0x00, 0xFE, 0x04, 0x00, 0x00, 0x01, 0x8C, 0xED, 0x02, 0x00, 0x10, 0x00, 0x03, 0x00,
            0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x42, 0x00, 0x00, 0x00, 0x43, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x0E, 0x00, 0x00, 0x00, 0x14, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x0F, 0x00, 0x00, 0x00, 0x0A, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x07, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x0C, 0x00, 0x00, 0x00,
            0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x11, 0x00, 0x00, 0x00, 0x1C, 0x00,
            0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x11, 0x00, 0x00, 0x00,
            0x35, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x12, 0x00,
            0x00, 0x00, 0x34, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x13, 0x00, 0x00, 0x00, 0x4D, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x13, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x14, 0x00, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x14, 0x00, 0x00, 0x00, 0x3E, 0x00, 0x00, 0x00, 0x08, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x15, 0x00, 0x00, 0x00, 0x11, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1A, 0x00, 0x00, 0x00, 0x3F, 0x00,
            0x00, 0x00, 0x1A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1A, 0x00, 0x00, 0x00,
            0x19, 0x00, 0x00, 0x00, 0x1A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x19, 0x00,
            0x01, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00,
            0x06, 0x00, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x09, 0x00, 0x00, 0x00, 0x0A, 0x00, 0x00, 0x00,
            0x0B, 0x00, 0x00, 0x00, 0x0D, 0x00, 0x00, 0x00, 0x0E, 0x00, 0x00, 0x00, 0x0F, 0x00, 0x00, 0x00,
            0x10, 0x00, 0x00, 0x00, 0x11, 0x00, 0x00, 0x00, 0x12, 0x00, 0x00, 0x00, 0x13, 0x00, 0x00, 0x00,
            0x14, 0x00, 0x00, 0x00, 0x15, 0x00, 0x00, 0x00, 0x18, 0x00, 0x00, 0x00, 0x19, 0x00, 0x00, 0x00,
            0x1A, 0x00, 0x00, 0x00, 0x1C, 0x00, 0x00, 0x00, 0x6C, 0xBF, 0x00, 0x00, 0x71, 0xBF, 0x00, 0x00,
            0x42, 0x00, 0x00, 0x00, 0x94, 0x01, 0x00, 0x00])
        conn.sendBuffer(unlockReply)
        conn.send(OutFavoritePacket.setCosmetics(cosmetics.ctItem, cosmetics.terItem,
            cosmetics.headItem, cosmetics.gloveItem, cosmetics.backItem, cosmetics.stepsItem,
            cosmetics.cardItem, cosmetics.sprayItem))
        conn.send(OutFavoritePacket.setLoadout(loadouts))
        conn.send(OutOptionPacket.setBuyMenu(buyMenu))
    }

    /**
     * send the host an user's inventory
     * @param hostUserId the target host's user ID
     * @param hostConn the target host's connection
     * @param targetUserId the target user's ID session
     */
    private static async sendUserInventoryTo(hostUserId: number, hostConn: ExtendedSocket,
                                             targetUserId: number): Promise<void> {
        const inventory: UserInventory = await UserInventory.getInventory(hostUserId)
        hostConn.send(OutHostPacket.setInventory(targetUserId, inventory.items))
    }

    /**
     * send the host an user's loadout
     * @param hostConn the target host's connection
     * @param targetUserId the target user's ID session
     */
    private static async sendUserLoadoutTo(hostConn: ExtendedSocket, targetUserId: number): Promise<void> {
        hostConn.send(await OutHostPacket.setLoadout(targetUserId))
    }

    /**
     * send the host an user's loadout
     * @param hostUserId the target host's user ID
     * @param hostConn the target host's connection
     * @param targetUserId the target user's ID session
     */
    private static async sendUserBuyMenuTo(hostConn: ExtendedSocket, targetUserId: number): Promise<void> {
        hostConn.send(await OutHostPacket.setBuyMenu(targetUserId))
    }

    private static SendUserDialogBox(userConn: ExtendedSocket, msg: string) {
        const badDialogData: OutChatPacket = OutChatPacket.systemMessage(msg, ChatMessageType.DialogBox)
        userConn.send(badDialogData)
    }
}
