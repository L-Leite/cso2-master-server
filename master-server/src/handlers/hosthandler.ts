import { ExtendedSocket } from 'extendedsocket'

import { ActiveConnections } from 'storage/activeconnections'

import { CSTeamNum } from 'gametypes/shareddefs'
import { HostPacketType } from 'packets/definitions'
import { UserInventory } from 'user/userinventory'

import { InHostPacket } from 'packets/in/host'
import { InHostItemUsed } from 'packets/in/host/itemused'
import { InHostIngame_AddKillCount } from 'packets/in/host/ingame_addkillcount'
import { InHostIngame_BuyItem } from 'packets/in/host/ingame_buyitem'
import { InHostIngame_PlayerDeath } from 'packets/in/host/ingame_playerdeath'
import { InHostIngame_PlayerSpawn } from 'packets/in/host/ingame_playerspawn'
import { InHostIngame_RoundEnd } from 'packets/in/host/ingame_roundend'
import { InHostSetBuyMenu } from 'packets/in/host/setbuymenu'
import { InHostSetInventory } from 'packets/in/host/setinventory'
import { InHostSetLoadout } from 'packets/in/host/setloadout'
import { InHostTeamChanging } from 'packets/in/host/teamchanging'

import { OutHostPacket } from 'packets/out/host'

/**
 * handles incoming host type packets
 */
export class HostHandler {
    /* constructor() {} */

    /**
     * handles the incoming host packets
     * @param packetData the host's packet data
     * @param connection the client's socket
     */
    public async onPacket(
        packetData: Buffer,
        connection: ExtendedSocket
    ): Promise<boolean> {
        const hostPacket = new InHostPacket(packetData)

        const session = connection.session

        if (session == null) {
            console.error(
                `couldn't get session from connection ${connection.uuid}`
            )
            return false
        }

        switch (hostPacket.packetType) {
            case HostPacketType.OnGameEnd:
                return this.onGameEnd(connection)
            case HostPacketType.SetInventory:
                return this.onSetUserInventory(hostPacket, connection)
            case HostPacketType.SetLoadout:
                return this.onSetUserLoadout(hostPacket, connection)
            case HostPacketType.SetBuyMenu:
                return this.onSetUserBuyMenu(hostPacket, connection)
            case HostPacketType.TeamChanging:
                return this.onTeamChangingRequest(packetData, connection)
            case HostPacketType.ItemUsed:
                return this.onItemUsed(hostPacket, connection)
            case HostPacketType.Ingame_AddPoint:
                return this.onIngameAddPoint(hostPacket, connection)
            case HostPacketType.Ingame_PlayerDeath:
                return this.onIngamePlayerDeath(hostPacket, connection)
            case HostPacketType.Ingame_RoundEnd:
                return this.onIngameRoundEnd(hostPacket, connection)
            case HostPacketType.Ingame_BuyItem:
                return this.onIngameBuyItem(hostPacket, connection)
            case HostPacketType.Ingame_PlayerSpawn:
                return this.onIngamePlayerSpawn(hostPacket, connection)
        }

        console.warn(
            'HostHandler::onPacket: unknown host packet type %i',
            hostPacket.packetType
        )

        return false
    }

    private onGameEnd(userConn: ExtendedSocket): boolean {
        const session = userConn.session

        if (session == null) {
            console.warn(
                `Could not get connection "${userConn.uuid}"'s session`
            )
            return false
        }

        if (session.isInRoom() === false) {
            console.warn(
                'User ID %i tried to end a match without being in a room',
                session.user.id
            )
            return false
        }

        const currentRoom = session.currentRoom

        if (currentRoom == null) {
            console.error(
                `Tried to get user's ${session.user.id} room but it couldn't be found. room id: ${currentRoom.id}`
            )
            return false
        }

        console.log(
            'Ending game for room "%s" (room id %i)',
            currentRoom.settings.roomName,
            currentRoom.id
        )

        currentRoom.endGame()

        return true
    }

    private onItemUsed(
        hostPacket: InHostPacket,
        userConn: ExtendedSocket
    ): boolean {
        const itemData = new InHostItemUsed(hostPacket)

        const targetConn = ActiveConnections.Singleton().FindByOwnerId(
            itemData.userId
        )

        const requesterSession = userConn.session
        const targetSession = targetConn.session

        if (requesterSession == null) {
            console.warn(`Could not get user ID's ${itemData.userId} session`)
            return false
        }

        if (requesterSession.isInRoom() === false) {
            console.warn(
                `User ID ${requesterSession.user.id} tried to send someone's team chaning request without being in a room`
            )
            return false
        }

        if (targetSession == null) {
            console.warn(
                `User ID ${requesterSession.user.id} tried to send someone's team changing request with user ID ${itemData.userId} whose session is null`
            )
            return false
        }

        const currentRoom = requesterSession.currentRoom

        if (currentRoom == null) {
            console.error(
                `Tried to get user's ${requesterSession.user.id} room but it couldn't be found.`
            )
            return false
        }

        if (currentRoom.host.userId !== requesterSession.user.id) {
            console.warn(
                `User ID ${requesterSession.user.id} sent User ID ${targetSession.user.id}'s team changing request without being the room's host. Real host ID: ${currentRoom.host.userId} room "${currentRoom.settings.roomName}" (id ${currentRoom.id})`
            )
            return false
        }

        userConn.send(OutHostPacket.itemUse(itemData.userId, itemData.itemId))

        console.log(
            `Sending user ID ${requesterSession.user.id}'s item ${itemData.itemId} using request to host ID ${currentRoom.host.userId}, room ${currentRoom.id}`
        )

        return true
    }

    private onTeamChangingRequest(
        packetData: Buffer,
        userConn: ExtendedSocket
    ): boolean {
        const teamData = new InHostTeamChanging(packetData)

        const targetConn: ExtendedSocket = ActiveConnections.Singleton().FindByOwnerId(
            teamData.userId
        )

        const requesterSession = userConn.session
        const targetSession = targetConn.session

        if (requesterSession == null) {
            console.warn(`Could not get user ID's ${teamData.userId} session`)
            return false
        }

        if (requesterSession.isInRoom() === false) {
            console.warn(
                `User ID ${requesterSession.user.id} tried to send someone's team chaning request without being in a room`
            )
            return false
        }

        if (targetSession == null) {
            console.warn(
                `User ID ${requesterSession.user.id} tried to send someone's team changing request with user ID ${teamData.userId} whose session is null`
            )
            return false
        }

        const currentRoom = requesterSession.currentRoom

        if (currentRoom == null) {
            console.error(
                `Tried to get user's ${requesterSession.user.id} room but it couldn't be found.`
            )
            return false
        }

        if (currentRoom.host.userId !== requesterSession.user.id) {
            console.warn(
                `User ID ${requesterSession.user.id} sent User ID ${targetSession.user.id}'s team changing request without being the room's host. Real host ID: ${currentRoom.host.userId} room "${currentRoom.settings.roomName}" (id ${currentRoom.id})`
            )
            return false
        }

        if (
            teamData.newTeam !== CSTeamNum.Terrorist &&
            teamData.newTeam !== CSTeamNum.CounterTerrorist
        ) {
            console.warn(
                `User Id ${targetSession.user.id} tried to change his team, but the value ${teamData.newTeam} is not allowed.`
            )
            return false
        }

        currentRoom.updateUserTeam(targetSession.user.id, teamData.newTeam)

        console.log(
            `Changing user ${requesterSession.user.id}'s team to ${teamData.newTeam} in room ${currentRoom.id}`
        )

        return true
    }

    private async onSetUserInventory(
        hostPacket: InHostPacket,
        userConn: ExtendedSocket
    ): Promise<boolean> {
        const preloadData = new InHostSetInventory(hostPacket)

        const targetConn = ActiveConnections.Singleton().FindByOwnerId(
            preloadData.userId
        )

        const requesterSession = userConn.session
        const targetSession = targetConn.session

        if (requesterSession == null) {
            console.warn(
                `Could not get user ID's ${preloadData.userId} session`
            )
            return false
        }

        if (requesterSession.isInRoom() === false) {
            console.warn(
                `User ID ${requesterSession.user.id} tried to send its inventory without being in a room`
            )
            return false
        }

        if (targetSession == null) {
            console.warn(
                `User ID ${requesterSession.user.id} tried to send its inventory to user ID ${preloadData.userId} whose session is null`
            )
            return false
        }

        const currentRoom = requesterSession.currentRoom

        if (currentRoom == null) {
            console.error(
                `Tried to get user's ${requesterSession.user.id} room but it couldn't be found.`
            )
            return false
        }

        if (currentRoom.host.userId !== requesterSession.user.id) {
            console.warn(
                `User ID ${requesterSession.user.id} sent an user's inventory request without being the room's host. Real host ID: ${currentRoom.host.userId} room "${currentRoom.settings.roomName}" (id ${currentRoom.id})`
            )
            return false
        }

        await this.sendUserInventoryTo(
            requesterSession.user.id,
            userConn,
            targetSession.user.id
        )

        console.log(
            `Sending user ID ${preloadData.userId}'s inventory to host ID ${currentRoom.host.userId}, room ${currentRoom.settings.roomName} (room id ${currentRoom.id})`
        )

        return true
    }

    private async onSetUserLoadout(
        hostPacket: InHostPacket,
        sourceConn: ExtendedSocket
    ): Promise<boolean> {
        const loadoutData = new InHostSetLoadout(hostPacket)

        const targetConn = ActiveConnections.Singleton().FindByOwnerId(
            loadoutData.userId
        )

        const requesterSession = sourceConn.session
        const targetSession = targetConn.session

        if (requesterSession == null) {
            console.warn(`Could not get user's ${loadoutData.userId} session`)
            return false
        }

        if (requesterSession.isInRoom() === false) {
            console.warn(
                'User ID %i tried to send loadout without being in a room',
                requesterSession.user.id
            )
            return false
        }

        if (targetSession == null) {
            console.warn(
                'User ID %i tried to send its loadout to user ID %i whose session is null',
                requesterSession.user.id,
                loadoutData.userId
            )
            return false
        }

        const currentRoom = requesterSession.currentRoom

        if (currentRoom == null) {
            console.error(
                `Tried to get user's ${requesterSession.user.id} room but it couldn't be found.`
            )
            return false
        }

        if (currentRoom.host.userId !== requesterSession.user.id) {
            console.warn(
                `User ${requesterSession.user.id} sent an user's loadout request without being the room's host. Real host: ${currentRoom.host.userId} room ${currentRoom.id}`
            )
            return false
        }

        await this.sendUserLoadoutTo(sourceConn, targetSession.user.id)

        console.log(
            `Sending user ${requesterSession.user.id}'s loadout to host ${currentRoom.host.userId}, room ${currentRoom.id}`
        )

        return true
    }

    private async onSetUserBuyMenu(
        hostPacket: InHostPacket,
        sourceConn: ExtendedSocket
    ): Promise<boolean> {
        const buyMenuData = new InHostSetBuyMenu(hostPacket)

        const targetConn = ActiveConnections.Singleton().FindByOwnerId(
            buyMenuData.userId
        )

        const requesterSession = sourceConn.session
        const targetSession = targetConn.session

        if (requesterSession == null) {
            console.warn(`Could not get user's ${buyMenuData.userId} session`)
            return false
        }

        if (requesterSession.isInRoom() === false) {
            console.warn(
                'User ID %i tried to send buy menu without being in a room',
                requesterSession.user.id
            )
            return false
        }

        if (targetSession == null) {
            console.warn(
                'User ID %i tried to send its buy menu to user ID %i whose session is null',
                requesterSession.user.id,
                buyMenuData.userId
            )
            return false
        }

        const currentRoom = requesterSession.currentRoom

        if (currentRoom == null) {
            console.error(
                `Tried to get user's ${requesterSession.user.id} room but it couldn't be found.`
            )
            return false
        }

        if (currentRoom.host.userId !== requesterSession.user.id) {
            console.warn(
                `User ${requesterSession.user.id} sent an user's buy menu request without being the room's host. Real host: ${currentRoom.host.userId} room ${currentRoom.id}`
            )
            return false
        }

        await this.sendUserBuyMenuTo(sourceConn, targetSession.user.id)

        console.debug(
            `Sending user ${requesterSession.user.id}'s buy menu to host ${currentRoom.host.userId}, room ${currentRoom.id}`
        )

        return true
    }

    private onIngameAddPoint(
        hostPacket: InHostPacket,
        userConn: ExtendedSocket
    ): boolean {
        const pointData = new InHostIngame_AddKillCount(hostPacket)
        console.log(
            `${pointData.scorerId} scored ${pointData.newKillsNum} kills. totalKills: ${pointData.totalFrags}`
        )
        return true
    }

    private onIngamePlayerDeath(
        hostPacket: InHostPacket,
        userConn: ExtendedSocket
    ): boolean {
        const deathData = new InHostIngame_PlayerDeath(hostPacket)
        console.debug(
            `${deathData.attacker.userId} killed ${
                deathData.victim.userId
            } with ${
                deathData.attacker.weaponId
            } (killFlags: ${deathData.killFlags.toString(16)})`
        )
        return true
    }

    private onIngameRoundEnd(
        hostPacket: InHostPacket,
        userConn: ExtendedSocket
    ): boolean {
        const roundData = new InHostIngame_RoundEnd(hostPacket)
        console.debug(
            `${
                roundData.winningTeamNum === 1 ? 'terrorists' : 'cts'
            } win the round. ct score: ${roundData.ctWins} ter score: ${
                roundData.terWins
            }`
        )
        return true
    }

    private onIngameBuyItem(
        hostPacket: InHostPacket,
        userConn: ExtendedSocket
    ): boolean {
        const buyData = new InHostIngame_BuyItem(hostPacket)
        console.debug(`${buyData.buyerId} bought ${buyData.GetItemBought()}`)
        return true
    }

    private onIngamePlayerSpawn(
        hostPacket: InHostPacket,
        userConn: ExtendedSocket
    ): boolean {
        const spawnData = new InHostIngame_PlayerSpawn(hostPacket)
        console.debug(
            `${spawnData.playerUserId} spawned at ${spawnData.spawnPoint.X} ${spawnData.spawnPoint.Y} ${spawnData.spawnPoint.Z}`
        )
        return true
    }

    /**
     * send the host an user's inventory
     * @param hostUserId the target host's user ID
     * @param hostConn the target host's connection
     * @param targetUserId the target user's ID session
     */
    private async sendUserInventoryTo(
        hostUserId: number,
        hostConn: ExtendedSocket,
        targetUserId: number
    ): Promise<void> {
        const inventory = await UserInventory.getInventory(hostUserId)
        hostConn.send(OutHostPacket.setInventory(targetUserId, inventory.items))
    }

    /**
     * send the host an user's loadout
     * @param hostConn the target host's connection
     * @param targetUserId the target user's ID session
     */
    private async sendUserLoadoutTo(
        hostConn: ExtendedSocket,
        targetUserId: number
    ): Promise<void> {
        hostConn.send(await OutHostPacket.setLoadout(targetUserId))
    }

    /**
     * send the host an user's loadout
     * @param hostUserId the target host's user ID
     * @param hostConn the target host's connection
     * @param targetUserId the target user's ID session
     */
    private async sendUserBuyMenuTo(
        hostConn: ExtendedSocket,
        targetUserId: number
    ): Promise<void> {
        hostConn.send(await OutHostPacket.setBuyMenu(targetUserId))
    }
}
