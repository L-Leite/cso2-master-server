import net from 'net'

import { ExtendedSocket } from 'extendedsocket'

import { Channel } from 'channel/channel'

import { User } from 'user/user'
import { UserInventory } from 'user/userinventory'
import { UserSession } from 'user/usersession'

import { ChannelManager } from 'channel/channelmanager'

import { ChatMessageType } from 'packets/definitions'
import { FavoritePacketType } from 'packets/definitions'
import { OptionPacketType } from 'packets/definitions'
import { UnlockCurrency } from 'gametypes/unlockitem'

import { InFavoritePacket } from 'packets/in/favorite'
import { InFavoriteSetCosmetics } from 'packets/in/favorite/setcosmetics'
import { InFavoriteSetLoadout } from 'packets/in/favorite/setloadout'
import { InLoginPacket } from 'packets/in/login'
import { InOptionPacket } from 'packets/in/option'
import { InOptionBuyMenu } from 'packets/in/option/buymenu'

import { OutChatPacket } from 'packets/out/chat'
import { OutFavoritePacket } from 'packets/out/favorite'
import { OutInventoryPacket } from 'packets/out/inventory'
import { OutOptionPacket } from 'packets/out/option'
import { OutUserInfoPacket } from 'packets/out/userinfo'
import { OutUserStartPacket } from 'packets/out/userstart'
import { OutUnlockPacket } from 'packets/out/unlock'

import { AboutMeHandler } from 'handlers/aboutmehandler'

import { UserService } from 'services/userservice'
import { ActiveConnections } from 'storage/activeconnections'

import {
    GAME_LOGIN_BAD_PASSWORD,
    GAME_LOGIN_BAD_USERNAME,
    GAME_LOGIN_INVALID_USERINFO
} from 'gamestrings'

// TODO: move this to UserManager, make UserManager not static
const aboutMeHandler = new AboutMeHandler()

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

        await UserService.Logout(session.user.id)
    }

    /**
     * called when we receive a login request packet
     * @param loginData the login packet's data
     * @param connection the login requester's connection
     * @param server the instance to the server
     */
    public static async onLoginPacket(
        loginData: Buffer,
        connection: ExtendedSocket,
        holepunchPort: number
    ): Promise<boolean> {
        const loginPacket: InLoginPacket = new InLoginPacket(loginData)

        const loggedUserId = await UserService.Login(
            loginPacket.gameUsername,
            loginPacket.password
        )

        if (loggedUserId === 0) {
            this.SendUserDialogBox(connection, GAME_LOGIN_BAD_USERNAME)

            console.warn(
                'Could not create session for user %s',
                loginPacket.gameUsername
            )
            return false
        }

        if (loggedUserId === -1) {
            this.SendUserDialogBox(connection, GAME_LOGIN_BAD_PASSWORD)

            console.warn(
                `Login attempt for user ${loginPacket.gameUsername} failed`
            )
            return false
        }

        // clear plain password right away, we don't need it anymore
        loginPacket.password = null

        const user: User = await UserService.GetUserById(loggedUserId)

        if (user == null) {
            this.SendUserDialogBox(connection, GAME_LOGIN_INVALID_USERINFO)

            console.error(`Couldn't get user ID ${loggedUserId}'s information`)
            return false
        }

        const newSession: UserSession = new UserSession(
            user,
            connection.address() as net.AddressInfo
        )
        connection.session = newSession

        console.log(
            `user ${user.username} logged in (uuid: ${connection.uuid})`
        )

        ActiveConnections.Singleton().Add(connection)

        UserManager.sendUserInfoToSelf(user, connection, holepunchPort)
        await UserManager.sendInventory(newSession.user.id, connection)
        ChannelManager.sendChannelListTo(connection)

        return true
    }

    public static async onAboutmePacket(
        packetData: Buffer,
        connection: ExtendedSocket
    ): Promise<boolean> {
        return await aboutMeHandler.OnPacket(packetData, connection)
    }

    /**
     * listens for option packets
     * @param optionData the packet's data
     * @param conn the sender's connection
     */
    public static async onOptionPacket(
        optionData: Buffer,
        conn: ExtendedSocket
    ): Promise<boolean> {
        if (conn.session == null) {
            console.warn(
                `connection ${conn.uuid} sent an option packet without a session`
            )
            return false
        }

        const optPacket: InOptionPacket = new InOptionPacket(optionData)

        switch (optPacket.packetType) {
            case OptionPacketType.SetBuyMenu:
                return this.onOptionSetBuyMenu(optPacket, conn)
        }

        console.warn(
            'UserManager::onOptionPacket: unknown packet type %i',
            optPacket.packetType
        )

        return false
    }

    public static async onOptionSetBuyMenu(
        optPacket: InOptionPacket,
        conn: ExtendedSocket
    ): Promise<boolean> {
        const buyMenuData: InOptionBuyMenu = new InOptionBuyMenu(optPacket)

        const session: UserSession = conn.session

        if (session == null) {
            console.warn(`Could not get connection "${conn.uuid}"'s session`)
            return false
        }

        console.log(`Setting user ID ${session.user.id}'s buy menu`)

        await UserInventory.setBuyMenu(session.user.id, buyMenuData.buyMenu)

        return true
    }

    public static async onFavoritePacket(
        favoriteData: Buffer,
        sourceConn: ExtendedSocket
    ): Promise<boolean> {
        if (sourceConn.session == null) {
            console.warn(
                `connection ${sourceConn.uuid} sent a favorite packet without a session`
            )
            return false
        }

        const favPacket: InFavoritePacket = new InFavoritePacket(favoriteData)

        switch (favPacket.packetType) {
            case FavoritePacketType.SetLoadout:
                return this.onFavoriteSetLoadout(favPacket, sourceConn)
            case FavoritePacketType.SetCosmetics:
                return this.onFavoriteSetCosmetics(favPacket, sourceConn)
        }

        console.warn(
            'UserManager::onFavoritePacket: unknown packet type %i',
            favPacket.packetType
        )

        return false
    }

    public static async onFavoriteSetLoadout(
        favPacket: InFavoritePacket,
        sourceConn: ExtendedSocket
    ): Promise<boolean> {
        const loadoutData: InFavoriteSetLoadout = new InFavoriteSetLoadout(
            favPacket
        )

        const session: UserSession = sourceConn.session

        if (session == null) {
            console.warn(
                `Could not get connection "${sourceConn.uuid}"'s session`
            )
            return false
        }

        const loadoutNum: number = loadoutData.loadout
        const slot: number = loadoutData.weaponSlot
        const itemId: number = loadoutData.itemId

        console.log(
            `Setting user ID ${session.user.id}'s new weapon ${itemId} to slot ${slot} in loadout ${loadoutNum}`
        )

        await UserInventory.setLoadoutWeapon(
            session.user.id,
            loadoutNum,
            slot,
            itemId
        )

        return true
    }

    public static async onFavoriteSetCosmetics(
        favPacket: InFavoritePacket,
        sourceConn: ExtendedSocket
    ): Promise<boolean> {
        const cosmeticsData: InFavoriteSetCosmetics = new InFavoriteSetCosmetics(
            favPacket
        )

        const session: UserSession = sourceConn.session

        if (session == null) {
            console.warn(
                `Could not get connection "${sourceConn.uuid}"'s session`
            )
            return false
        }

        const slot: number = cosmeticsData.slot
        const itemId: number = cosmeticsData.itemId

        console.debug(
            `Setting user ID ${session.user.id}'s new cosmetic ${itemId} to slot ${slot}`
        )

        await UserInventory.setCosmeticSlot(session.user.id, slot, itemId)

        return true
    }

    /**
     * send an user's info to itself
     * @param user the target user's object
     * @param conn the target user's connection
     * @param holepunchPort the master server's UDP holepunching port
     */
    private static sendUserInfoToSelf(
        user: User,
        conn: ExtendedSocket,
        holepunchPort: number
    ): void {
        conn.send(
            new OutUserStartPacket(
                user.id,
                user.username,
                user.playername,
                holepunchPort
            )
        )

        conn.send(OutUserInfoPacket.fullUserUpdate(user))
    }

    /**
     * sends an user's inventory to itself
     * @param userId the target user's ID
     * @param conn the target user's connection
     */
    private static async sendInventory(
        userId: number,
        conn: ExtendedSocket
    ): Promise<void> {
        const [inventory, cosmetics, loadouts, buyMenu] = await Promise.all([
            UserInventory.getInventory(userId),
            UserInventory.getCosmetics(userId),
            UserInventory.getAllLoadouts(userId),
            UserInventory.getBuyMenu(userId)
        ])

        if (
            inventory == null ||
            cosmetics == null ||
            loadouts == null ||
            buyMenu == null
        ) {
            return
        }

        conn.send(OutInventoryPacket.createInventory(inventory.items))
        /* const defaultInvReply: Buffer =
            new OutInventoryPacket(conn).addInventory(inventory.getDefaultInventory())
        conn.send(defaultInvReply)*/

        /* const achievementReply: Buffer = Buffer.from([0x55, 0x12, 0x23, 0x00, 0x60, 0x04, 0x2C, 0x00, 0x02, 0x02,
            0x40, 0x00, 0x00, 0x00, 0x03, 0xDE, 0x07, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0xD8, 0x07, 0x00, 0x00,
            0x04, 0x00, 0x00, 0x00, 0xDD, 0x07, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00])
        conn.sendBuffer(achievementReply)

        const achievementReply2: Buffer = Buffer.from([0x55, 0x13, 0x2B, 0x00, 0x60, 0x04, 0x2D, 0x00, 0x02, 0x02,
            0x40, 0x00, 0x00, 0x00, 0x04, 0x40, 0x1F, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x42, 0x1F, 0x00, 0x00,
            0x01, 0x00, 0x00, 0x00, 0x44, 0x1F, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x54, 0xC3, 0x00, 0x00, 0x01,
            0x00, 0x00, 0x00])
        conn.sendBuffer(achievementReply2)

        const achievementReply3: Buffer = Buffer.from([0x55, 0x14, 0x2B, 0x00, 0x60, 0x04, 0x2E, 0x00, 0x02, 0x02,
            0x40, 0x00, 0x00, 0x00, 0x04, 0x54, 0xC3, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x36, 0x21, 0x00, 0x00,
            0x01, 0x00, 0x00, 0x00, 0xE6, 0x07, 0x00, 0x00, 0x01, 0x00, 0x07, 0x00, 0xE4, 0x07, 0x00, 0x00, 0x05,
            0x00, 0x00, 0x00])
        conn.sendBuffer(achievementReply3) */

        conn.send(OutUnlockPacket.createUnlockInfo([], []))
        conn.send(
            OutFavoritePacket.setCosmetics(
                cosmetics.ct_item,
                cosmetics.ter_item,
                cosmetics.head_item,
                cosmetics.glove_item,
                cosmetics.back_item,
                cosmetics.steps_item,
                cosmetics.card_item,
                cosmetics.spray_item
            )
        )
        conn.send(OutFavoritePacket.setLoadout(loadouts))
        conn.send(OutOptionPacket.setBuyMenu(buyMenu))
    }

    private static SendUserDialogBox(userConn: ExtendedSocket, msg: string) {
        const badDialogData: OutChatPacket = OutChatPacket.systemMessage(
            msg,
            ChatMessageType.DialogBox
        )
        userConn.send(badDialogData)
    }
}
