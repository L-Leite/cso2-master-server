import { Channel } from 'channel/channel'
import { ChannelServer } from 'channel/channelserver'

import { Room, RoomReadyStatus, RoomStatus } from 'room/room'

import { UserManager } from 'user/usermanager'
import { UserSession } from 'user/usersession'

import { ExtendedSocket } from 'extendedsocket'

import { InRequestRoomListPacket } from 'packets/in/requestroomlist'
import { InRoomPacket, InRoomType } from 'packets/in/room'
import { InRoomCountdown } from 'packets/in/room/countdown'
import { InRoomNewRequest } from 'packets/in/room/fullrequest'
import { InRoomJoinRequest } from 'packets/in/room/joinrequest'
import { InRoomSetUserTeamRequest } from 'packets/in/room/setuserteamreq'
import { InRoomUpdateSettings } from 'packets/in/room/updatesettings'

import { OutLobbyPacket } from 'packets/out/lobby'
import { OutRoomListPacket } from 'packets/out/roomlist'
import { OutServerListPacket } from 'packets/out/serverlist'

/**
 * stores the channel servers and processes their data
 * @class ChannelManager
 */
export class ChannelManager {
    /**
     * called when the user sends a RequestChannels packet
     * @param sourceConn the user's socket
     */
    public static async onChannelListPacket(sourceConn: ExtendedSocket): Promise<boolean> {
        console.log('user ID %i requested server list', sourceConn.getOwner())
        this.sendChannelListTo(sourceConn)

        return true
    }

    /**
     * called when the user sends a Room packet
     * @param reqData the packet's data
     * @param sourceConn the user's socket
     * @param users the user manager object
     */
    public static async onRoomRequest(reqData: Buffer, sourceConn: ExtendedSocket): Promise<boolean> {
        const roomPacket: InRoomPacket = new InRoomPacket(reqData)

        switch (roomPacket.packetType) {
            case InRoomType.NewRoomRequest:
                return this.onNewRoomRequest(roomPacket, sourceConn)
            case InRoomType.JoinRoomRequest:
                return this.onJoinRoomRequest(roomPacket, sourceConn)
            case InRoomType.GameStartRequest:
                return this.onGameStartRequest(sourceConn)
            case InRoomType.LeaveRoomRequest:
                return this.onLeaveRoomRequest(sourceConn)
            case InRoomType.ToggleReadyRequest:
                return this.onToggleReadyRequest(sourceConn)
            case InRoomType.UpdateSettings:
                return this.onRoomUpdateSettings(roomPacket, sourceConn)
            case InRoomType.OnCloseResultWindow:
                return this.onCloseResultRequest(sourceConn)
            case InRoomType.SetUserTeamRequest:
                return this.onSetTeamRequest(roomPacket, sourceConn)
            case InRoomType.GameStartCountdownRequest:
                return this.onGameStartToggleRequest(roomPacket, sourceConn)
        }

        console.warn('Unknown room request %i', roomPacket.packetType)

        return true
    }

    /**
     * called when the user sends a RequestRoomList packet
     * @param packetData the packet's data
     * @param sourceSocket the user's socket
     * @param users the user manager object
     */
    public static async onRoomListPacket(packetData: Buffer, sourceConn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = await UserSession.get(sourceConn.getOwner())

        if (session == null) {
            console.warn('Couldn\'t get user ID %i\'s session', sourceConn.getOwner())
            return false
        }

        const listReq: InRequestRoomListPacket = new InRequestRoomListPacket(packetData)

        const server: ChannelServer = this.getServerByIndex(listReq.channelServerIndex)

        if (server == null) {
            console.warn('user ID %i requested room list, but it isn\'t in a channel server', sourceConn.getOwner())
            return false
        }

        const channel: Channel = server.getChannelByIndex(listReq.channelIndex)

        if (channel == null) {
            console.warn('user ID %i requested room list, but it isn\'t in a channel', sourceConn.getOwner())
            return false
        }

        console.log('user "%s" requested room list successfully, sending it...', sourceConn.getOwner())
        this.setUserChannel(session, sourceConn, channel, server)

        return true
    }

    /**
     * send the channel servers list data for an user's connection
     * @param conn the target user's connection
     */
    public static sendChannelListTo(conn: ExtendedSocket): void {
        conn.send(new OutServerListPacket(this.channelServers))
    }

    public static async sendRoomListTo(conn: ExtendedSocket, channel: Channel): Promise<void> {
        conn.send(OutLobbyPacket.joinRoom())
        conn.send(await OutRoomListPacket.getFullList(channel.rooms))
    }

    /**
     * returns a channel object by its channel index and channel server index
     * @param channelIndex the channel's index
     * @param channelServerIndex the channel's channel server index
     */
    public static getChannel(channelIndex: number, channelServerIndex: number): Channel {
        return ChannelManager.getServerByIndex(channelServerIndex).getChannelByIndex(channelIndex)
    }

    private static channelServers: ChannelServer[] = [new ChannelServer('Test server', 1, 1, 1)]

    /**
     * sets an user's current channel
     * @param session the target user's session
     * @param channel the target channel
     * @param channelServer the channel's channelServer
     */
    private static async setUserChannel(session: UserSession, conn: ExtendedSocket,
                                        channel: Channel, channelServer: ChannelServer): Promise<void> {
        session.setCurrentChannelIndex(channelServer.index, channel.index)
        await session.update()
        this.sendRoomListTo(conn, channel)
    }

    /**
     * get a channel server by its index
     * @param index the server index
     */
    private static getServerByIndex(index: number): ChannelServer {
        for (const server of this.channelServers) {
            if (server.index === index) {
                return server
            }
        }
        return null
    }

    /**
     * called when the user requests to create a new room
     * @param roomPacket the incoming packet
     * @param sourceConn the packet's source connection
     * @returns true if successful
     */
    private static async onNewRoomRequest(roomPacket: InRoomPacket, sourceConn: ExtendedSocket): Promise<boolean> {
        const newRoomReq: InRoomNewRequest = new InRoomNewRequest(roomPacket)

        const session: UserSession = await UserSession.get(sourceConn.getOwner())

        if (session == null) {
            console.warn('Could not get user ID %i\'s session', sourceConn.getOwner())
            return false
        }

        // if the user wants to create a new room, let it
        // this will remove the user from its current room
        // it should help mitigating the 'ghost room' issue,
        // where a room has users that aren't in it on the client's side
        if (session.currentRoomId !== 0) {
            const curRoom: Room = UserManager.getSessionCurRoom(session)
            console.warn('user ID %i tried to create a new room, while in an existing one current room: "%s" (id: %i)',
                session.currentRoomId, curRoom.settings.roomName, curRoom.id)

            curRoom.removeUser(session.userId)
            session.currentRoomId = 0
            await session.update()

            return false
        }

        const server: ChannelServer = this.getServerByIndex(session.currentChannelServerIndex)

        if (server == null) {
            console.warn('user ID %i requested a new room, but it isn\'t in a channel server', session.userId)
            return false
        }

        const channel: Channel = server.getChannelByIndex(session.currentChannelIndex)

        if (channel == null) {
            console.warn('user ID %i  requested a new room, but it isn\'t in a channel', session.userId)
            return false
        }

        const newRoom: Room = channel.createRoom(session.userId, sourceConn, {
            gameModeId: newRoomReq.gameModeId,
            killLimit: newRoomReq.killLimit,
            mapId: newRoomReq.mapId,
            roomName: newRoomReq.roomName,
            winLimit: newRoomReq.winLimit,
        })

        session.currentRoomId = newRoom.id
        await session.update()

        newRoom.sendJoinNewRoom(session.userId)
        newRoom.sendRoomSettingsTo(session.userId)

        console.log('user ID %i created a new room. name: "%s" (id: %i)',
            session.userId, newRoom.settings.roomName, newRoom.id)

        return true
    }

    /**
     * called when the user requests to join an existing room
     * @param roomPacket the incoming packet
     * @param sourceConn the packet's source connection
     * @returns true if successful
     */
    private static async onJoinRoomRequest(roomPacket: InRoomPacket, sourceConn: ExtendedSocket): Promise<boolean> {
        const joinReq: InRoomJoinRequest = new InRoomJoinRequest(roomPacket)

        const session: UserSession = await UserSession.get(sourceConn.getOwner())

        if (session == null) {
            console.warn('Could not get user ID %i\'s session', sourceConn.getOwner())
            return false
        }

        const desiredRoom: Room = UserManager.getSessionCurRoom(session)

        if (desiredRoom == null) {
            console.warn('user ID %i tried to join a non existing room. room id: %i',
                sourceConn.getOwner(), joinReq.roomId)
            return false
        }

        if (desiredRoom.hasFreeSlots() === false) {
            console.warn('user ID %i tried to join a full room. room name "%s" room id: %i',
                sourceConn.getOwner(), desiredRoom.settings.roomName, desiredRoom.id)
            return false
        }

        desiredRoom.addUser(session.userId, sourceConn)
        session.currentRoomId = desiredRoom.id
        await session.update()

        desiredRoom.sendJoinNewRoom(session.userId)
        desiredRoom.sendRoomSettingsTo(session.userId)

        desiredRoom.updateNewPlayerReadyStatus(session.userId)

        console.log('user id %i joined a room. room name: "%s" room id: %i',
            sourceConn.getOwner(), desiredRoom.settings.roomName, desiredRoom.id)

        return true
    }

    /**
     * called when the user (must be host) requests to start the game
     * after the countdown is complete
     * @param sourceConn the source connection
     * @returns true if successful
     */
    private static async onGameStartRequest(sourceConn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = await UserSession.get(sourceConn.getOwner())

        if (session == null) {
            console.warn('Could not get user ID %i\'s session', sourceConn.getOwner())
            return false
        }

        const currentRoom: Room = UserManager.getSessionCurRoom(session)

        if (currentRoom == null) {
            console.warn('user ID %i tried to start a room\'s match, although it isn\'t in any', sourceConn.getOwner())
            return false
        }

        // if started by the host
        if (session.userId === currentRoom.host.userId) {
            currentRoom.hostGameStart()
            console.debug('host ID %i is starting a match in room "%s" (room id: %i)',
                session.userId, currentRoom.settings.roomName, currentRoom.id)
            return true
        } else if (currentRoom.getStatus() === RoomStatus.Ingame) {
            currentRoom.guestGameJoin(session.userId)
            console.debug('user ID %i is joining a match in room "%s" (room id: %i)',
                session.userId, currentRoom.settings.roomName, currentRoom.id)
            return true
        }

        console.warn('user ID %i tried to start a room\'s match, although it isn\'t the host.'
            + 'room name "%s" room id: %i',
            session.userId, currentRoom.settings.roomName, currentRoom.id)

        return false
    }

    /**
     * called when the user requests to leave the current room its in
     * @param sourceConn the source connection
     * @returns true if successful
     */
    private static async onLeaveRoomRequest(sourceConn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = await UserSession.get(sourceConn.getOwner())

        if (session == null) {
            console.warn('Could not get user ID %i\'s session', sourceConn.getOwner())
            return false
        }

        const currentRoom: Room = UserManager.getSessionCurRoom(session)

        if (currentRoom == null) {
            console.warn('user ID %i tried to leave a room, although it isn\'t in any', sourceConn.getOwner())
            return false
        }

        if (currentRoom.isUserReady(session.userId)
            && currentRoom.isGlobalCountdownInProgress()) {
            return false
        }

        currentRoom.removeUser(session.userId)
        session.currentRoomId = 0
        await session.update()

        console.log('user ID %i left room "%s" (room id: %i)',
            session.userId, currentRoom.settings.roomName, currentRoom.id)

        this.sendRoomListTo(sourceConn,
            this.getChannel(session.currentChannelIndex, session.currentChannelServerIndex))

        return true
    }

    /**
     * called when the user requests to toggle ready status
     * @param sourceConn the source connection
     * @returns true if successful
     */
    private static async onToggleReadyRequest(sourceConn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = await UserSession.get(sourceConn.getOwner())

        if (session == null) {
            console.warn('Could not get user ID %i\'s session', sourceConn.getOwner())
            return false
        }

        const currentRoom: Room = UserManager.getSessionCurRoom(session)

        if (currentRoom == null) {
            console.warn('user ID %i tried toggle ready status, although it isn\'t in any room', session.userId)
            return false
        }

        const readyStatus: RoomReadyStatus = currentRoom.toggleUserReadyStatus(session.userId)

        if (readyStatus == null) {
            console.warn('failed to set user ID %i\'s ready status', session.userId)
            return false
        }

        // inform every user in the room of the changes
        currentRoom.broadcastNewUserReadyStatus(session.userId)

        if (readyStatus === RoomReadyStatus.Ready) {
            console.log('user ID %i readied in room "%s" (id %i)',
                session.userId, currentRoom.settings.roomName, currentRoom.id)
        } else if (readyStatus === RoomReadyStatus.NotReady) {
            console.log('user ID %i unreadied in room "%s" (id %i)',
                session.userId, currentRoom.settings.roomName, currentRoom.id)
        } else {
            console.log('user ID %i did something with ready status. status: %i room \""%s"\" (id %i)',
                session.userId, readyStatus, currentRoom.settings.roomName, currentRoom.id)
        }

        return true
    }

    /**
     * called when the user requests to update its current room settings
     * @param roomPacket the incoming packet
     * @param sourceConn the packet's source connection
     * @returns true if successful
     */
    private static async onRoomUpdateSettings(roomPacket: InRoomPacket, sourceConn: ExtendedSocket): Promise<boolean> {
        const newSettingsReq: InRoomUpdateSettings = new InRoomUpdateSettings(roomPacket)

        const session: UserSession = await UserSession.get(sourceConn.getOwner())

        if (session == null) {
            console.warn('Could not get user ID %i\'s session', sourceConn.getOwner())
            return false
        }

        const currentRoom: Room = UserManager.getSessionCurRoom(session)

        if (currentRoom == null) {
            console.warn('user ID %i tried to update a room\'s settings, although it isn\'t in any', session.userId)
            return false
        }

        if (session.userId !== currentRoom.host.userId) {
            console.warn('user ID %i tried to update a room\'s settings, although it isn\'t the host.'
                + 'room name "%s" room id: %i',
                session.userId, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        if (currentRoom.isGlobalCountdownInProgress()) {
            console.warn('user ID %i tried to update a room\'s settings, although a countdown is in progress.'
                + 'room name "%s" room id: %i',
                session.userId, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        currentRoom.updateSettings(newSettingsReq)

        console.log('host ID %i updated room "%s"\'s settings (room id: %i)',
            session.userId, currentRoom.settings.roomName, currentRoom.id)

        return true
    }

    /**
     * called when the user requests to update its current room settings
     * @param sourceConn the source connection
     * @returns true if successful
     */
    private static async onCloseResultRequest(sourceConn: ExtendedSocket): Promise<boolean> {
        if (sourceConn.hasOwner() === false) {
            console.warn('Connection %s tried to close results window without owner', sourceConn.uuid)
            return false
        }

        Room.sendCloseResultWindow(sourceConn)

        console.log('user ID %i closed game result window', sourceConn.getOwner())

        return true
    }

    /**
     * called when the user requests to change team
     * @param roomPacket the incoming packet
     * @param sourceConn the packet's source connection
     * @returns true if successful
     */
    private static async onSetTeamRequest(roomPacket: InRoomPacket, sourceConn: ExtendedSocket): Promise<boolean> {
        const setTeamReq: InRoomSetUserTeamRequest = new InRoomSetUserTeamRequest(roomPacket)

        const session: UserSession = await UserSession.get(sourceConn.getOwner())

        if (session == null) {
            console.warn('Could not get user ID %i\'s session', sourceConn.getOwner())
            return false
        }

        const currentRoom: Room = UserManager.getSessionCurRoom(session)

        if (currentRoom == null) {
            console.warn('user ID %i tried change team in a room, although it isn\'t in any', session.userId)
            return false
        }

        if (currentRoom.isUserReady(session.userId)) {
            console.warn('user ID %i tried change team in a room, although it\'s ready. room name "%s" room id: %i',
                session.userId, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        if (currentRoom.settings.areBotsEnabled
            && session.userId !== currentRoom.host.userId) {
            console.warn('user ID %i tried change team in a room when bot mode is enabled, but its not the host.'
                + 'room name "%s" room id: %i',
                session.userId, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        currentRoom.updateUserTeam(session.userId, setTeamReq.newTeam)

        console.log('user ID %i changed to team %i. room name "%s" room id: %i',
            session.userId, setTeamReq.newTeam, currentRoom.settings.roomName, currentRoom.id)

        return true
    }

    /**
     * called when the user (must be host) requests to start
     * counting down until the game starts
     * @param roomPacket the incoming packet
     * @param sourceConn the packet's source connection
     * @returns true if successful
     */
    private static async onGameStartToggleRequest(roomPacket: InRoomPacket,
                                                  sourceConn: ExtendedSocket): Promise<boolean> {
        const countdownReq: InRoomCountdown = new InRoomCountdown(roomPacket)

        const session: UserSession = await UserSession.get(sourceConn.getOwner())

        if (session == null) {
            console.warn('Could not get user ID %i\'s session', sourceConn.getOwner())
            return false
        }

        const currentRoom: Room = UserManager.getSessionCurRoom(session)

        if (currentRoom == null) {
            console.warn('user ID %i tried to toggle a room\'s game start countdown, although it isn\'t in any',
                session.userId)
            return false
        }

        if (session.userId !== currentRoom.host.userId) {
            console.warn('user ID %i tried to toggle a room\'s game start countdown, although it isn\'t the host.'
                + 'room name "%s" room id: %i',
                session.userId, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        const shouldCountdown: boolean = countdownReq.shouldCountdown()
        const count: number = countdownReq.count

        if (currentRoom.canStartGame() === false) {
            console.warn('user ID %i tried to toggle a room\'s game start countdown, although it can\'t start. '
                + 'room name "%s" room id: %i',
                session.userId, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        if (shouldCountdown) {
            currentRoom.progressCountdown(count)
            console.log('room "%s"\'s (id %i) countdown is at %i (host says it\'s at %i)',
                currentRoom.settings.roomName, currentRoom.id, currentRoom.getCountdown(), count)
        } else {
            currentRoom.stopCountdown()
            console.log('user ID %i canceled room "%s"\'s (id %i) countdown',
                session.userId, currentRoom.settings.roomName, currentRoom.id)
        }

        currentRoom.broadcastCountdown(shouldCountdown)

        return true
    }
}
