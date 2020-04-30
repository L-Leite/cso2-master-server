
import { Channel } from 'channel/channel'
import { ChannelManager } from 'channel/channelmanager'

import { ExtendedSocket } from 'extendedsocket'

import { Room, RoomReadyStatus, RoomStatus } from 'room/room'

import { UserSession } from 'user/usersession'

import { InRoomPacket, InRoomType } from 'packets/in/room'
import { InRoomCountdown } from 'packets/in/room/countdown'
import { InRoomNewRequest } from 'packets/in/room/fullrequest'
import { InRoomJoinRequest } from 'packets/in/room/joinrequest'
import { InRoomSetUserTeamRequest } from 'packets/in/room/setuserteamreq'
import { InRoomUpdateSettings } from 'packets/in/room/updatesettings'

export class RoomHandler {
    /**
     * called when the user sends a Room packet
     * @param reqData the packet's data
     * @param sourceConn the user's socket
     * @param users the user manager object
     */
    public async onRoomRequest(reqData: Buffer, sourceConn: ExtendedSocket): Promise<boolean> {
        if (sourceConn.session == null) {
            console.warn(`connection ${sourceConn.uuid} did a room request without a session`)
            return false
        }

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
     * returns a channel object by its channel index and channel server index
     * @param channelIndex the channel's index
     * @param channelServerIndex the channel's channel server index
     */
    public getChannel(channelIndex: number, channelServerIndex: number): Channel {
        return ChannelManager.getServerByIndex(channelServerIndex).getChannelByIndex(channelIndex)
    }

    /**
     * called when the user requests to create a new room
     * @param roomPacket the incoming packet
     * @param sourceConn the packet's source connection
     * @returns true if successful
     */
    private async onNewRoomRequest(roomPacket: InRoomPacket, sourceConn: ExtendedSocket): Promise<boolean> {
        const newRoomReq: InRoomNewRequest = new InRoomNewRequest(roomPacket)

        const session: UserSession = sourceConn.session

        // if the user wants to create a new room, let it
        // this will remove the user from its current room
        // it should help mitigating the 'ghost room' issue,
        // where a room has users that aren't in it on the client's side
        if (session.currentRoom != null) {
            const curRoom: Room = session.currentRoom
            console.warn('user ID %i tried to create a new room, while in an existing one current room: "%s" (id: %i)',
                curRoom.id, curRoom.settings.roomName, curRoom.id)

            curRoom.removeUser(session.user.userId)
            session.currentRoom = null

            // return false
        }

        const channel: Channel = session.currentChannel

        if (channel == null) {
            console.warn('user ID %i requested a new room, but it isn\'t in a channel', session.user.userId)
            return false
        }

        const newRoom: Room = channel.createRoom(session.user.userId, sourceConn, {
            gameModeId: newRoomReq.gameModeId,
            killLimit: newRoomReq.killLimit,
            mapId: newRoomReq.mapId,
            roomName: newRoomReq.roomName,
            winLimit: newRoomReq.winLimit,
        })

        session.currentRoom = newRoom

        newRoom.sendJoinNewRoom(session.user.userId)
        newRoom.sendRoomSettingsTo(session.user.userId)

        console.log('user ID %i created a new room. name: "%s" (id: %i)',
            session.user.userId, newRoom.settings.roomName, newRoom.id)

        return true
    }

    /**
     * called when the user requests to join an existing room
     * @param roomPacket the incoming packet
     * @param sourceConn the packet's source connection
     * @returns true if successful
     */
    private async onJoinRoomRequest(roomPacket: InRoomPacket, sourceConn: ExtendedSocket): Promise<boolean> {
        const joinReq: InRoomJoinRequest = new InRoomJoinRequest(roomPacket)

        const session: UserSession = sourceConn.session
        const channel: Channel = session.currentChannel

        if (channel == null) {
            console.warn('user ID %i tried to join a room, but it isn\'t in a channel', session.user.userId)
            return false
        }

        const desiredRoom: Room = channel.getRoomById(joinReq.roomId)

        if (desiredRoom == null) {
            console.warn('user ID %i tried to join a non existing room. room id: %i',
                session.user.userId, joinReq.roomId)
            return false
        }

        if (desiredRoom.hasFreeSlots() === false) {
            console.warn('user ID %i tried to join a full room. room name "%s" room id: %i',
                session.user.userId, desiredRoom.settings.roomName, desiredRoom.id)
            return false
        }

        desiredRoom.addUser(session.user.userId, sourceConn)
        session.currentRoom = desiredRoom

        desiredRoom.sendJoinNewRoom(session.user.userId)
        desiredRoom.sendRoomSettingsTo(session.user.userId)

        desiredRoom.updateNewPlayerReadyStatus(session.user.userId)

        console.log('user id %i joined a room. room name: "%s" room id: %i',
            session.user.userId, desiredRoom.settings.roomName, desiredRoom.id)

        return true
    }

    /**
     * called when the user (must be host) requests to start the game
     * after the countdown is complete
     * @param sourceConn the source connection
     * @returns true if successful
     */
    private async onGameStartRequest(sourceConn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = sourceConn.session
        const currentRoom: Room = session.currentRoom

        if (currentRoom == null) {
            console.warn('user ID %i tried to start a room\'s match, although it isn\'t in any', session.user.userId)
            return false
        }

        // if started by the host
        if (session.user.userId === currentRoom.host.userId) {
            currentRoom.hostGameStart()
            console.debug('host ID %i is starting a match in room "%s" (room id: %i)',
                session.user.userId, currentRoom.settings.roomName, currentRoom.id)
            return true
        } else if (currentRoom.getStatus() === RoomStatus.Ingame) {
            await currentRoom.guestGameJoin(session.user.userId)
            console.debug('user ID %i is joining a match in room "%s" (room id: %i)',
                session.user.userId, currentRoom.settings.roomName, currentRoom.id)
            return true
        }

        console.warn('user ID %i tried to start a room\'s match, although it isn\'t the host.'
            + 'room name "%s" room id: %i',
            session.user.userId, currentRoom.settings.roomName, currentRoom.id)

        return false
    }

    /**
     * called when the user requests to leave the current room its in
     * @param sourceConn the source connection
     * @returns true if successful
     */
    private async onLeaveRoomRequest(sourceConn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = sourceConn.session
        const currentRoom: Room = session.currentRoom

        if (currentRoom == null) {
            console.warn('user ID %i tried to leave a room, although it isn\'t in any', session.user.userId)
            return false
        }

        if (currentRoom.isUserReady(session.user.userId)
            && currentRoom.isGlobalCountdownInProgress()) {
            return false
        }

        currentRoom.removeUser(session.user.userId)
        session.currentRoom = null

        console.log('user ID %i left room "%s" (room id: %i)',
            session.user.userId, currentRoom.settings.roomName, currentRoom.id)

        await ChannelManager.sendRoomListTo(sourceConn, session.currentChannel)

        return true
    }

    /**
     * called when the user requests to toggle ready status
     * @param sourceConn the source connection
     * @returns true if successful
     */
    private async onToggleReadyRequest(sourceConn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = sourceConn.session
        const currentRoom: Room = session.currentRoom

        if (currentRoom == null) {
            console.warn('user ID %i tried toggle ready status, although it isn\'t in any room', session.user.userId)
            return false
        }

        const readyStatus: RoomReadyStatus = currentRoom.toggleUserReadyStatus(session.user.userId)

        if (readyStatus == null) {
            console.warn('failed to set user ID %i\'s ready status', session.user.userId)
            return false
        }

        // inform every user in the room of the changes
        currentRoom.broadcastNewUserReadyStatus(session.user.userId)

        if (readyStatus === RoomReadyStatus.Ready) {
            console.log('user ID %i readied in room "%s" (id %i)',
                session.user.userId, currentRoom.settings.roomName, currentRoom.id)
        } else if (readyStatus === RoomReadyStatus.NotReady) {
            console.log('user ID %i unreadied in room "%s" (id %i)',
                session.user.userId, currentRoom.settings.roomName, currentRoom.id)
        } else {
            console.log('user ID %i did something with ready status. status: %i room \""%s"\" (id %i)',
                session.user.userId, readyStatus, currentRoom.settings.roomName, currentRoom.id)
        }

        return true
    }

    /**
     * called when the user requests to update its current room settings
     * @param roomPacket the incoming packet
     * @param sourceConn the packet's source connection
     * @returns true if successful
     */
    private async onRoomUpdateSettings(roomPacket: InRoomPacket, sourceConn: ExtendedSocket): Promise<boolean> {
        const newSettingsReq: InRoomUpdateSettings = new InRoomUpdateSettings(roomPacket)

        const session: UserSession = sourceConn.session
        const currentRoom: Room = session.currentRoom

        if (currentRoom == null) {
            console.warn(`user ${session.user.userId} tried to update a room's settings without being in one`)
            return false
        }

        if (session.user.userId !== currentRoom.host.userId) {
            console.warn('user ID %i tried to update a room\'s settings, although it isn\'t the host.'
                + 'room name "%s" room id: %i',
                session.user.userId, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        if (currentRoom.isGlobalCountdownInProgress()) {
            console.warn('user ID %i tried to update a room\'s settings, although a countdown is in progress.'
                + 'room name "%s" room id: %i',
                session.user.userId, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        currentRoom.updateSettings(newSettingsReq)

        console.log('host ID %i updated room "%s"\'s settings (room id: %i)',
            session.user.userId, currentRoom.settings.roomName, currentRoom.id)

        return true
    }

    /**
     * called when the user requests to update its current room settings
     * @param sourceConn the source connection
     * @returns true if successful
     */
    private onCloseResultRequest(sourceConn: ExtendedSocket): boolean {
        Room.sendCloseResultWindow(sourceConn)
        console.log(`user ID ${sourceConn.session.user.userId} closed game result window`)
        return true
    }

    /**
     * called when the user requests to change team
     * @param roomPacket the incoming packet
     * @param sourceConn the packet's source connection
     * @returns true if successful
     */
    private async onSetTeamRequest(roomPacket: InRoomPacket, sourceConn: ExtendedSocket): Promise<boolean> {
        const setTeamReq: InRoomSetUserTeamRequest = new InRoomSetUserTeamRequest(roomPacket)

        const session: UserSession = sourceConn.session
        const currentRoom: Room = session.currentRoom

        if (currentRoom == null) {
            console.warn('user ID %i tried change team in a room, although it isn\'t in any', session.user.userId)
            return false
        }

        if (currentRoom.isUserReady(session.user.userId)) {
            console.warn('user ID %i tried change team in a room, although it\'s ready. room name "%s" room id: %i',
                session.user.userId, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        if (currentRoom.settings.areBotsEnabled
            && session.user.userId !== currentRoom.host.userId) {
            console.warn('user ID %i tried change team in a room when bot mode is enabled, but its not the host.'
                + 'room name "%s" room id: %i',
                session.user.userId, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        currentRoom.updateUserTeam(session.user.userId, setTeamReq.newTeam)

        console.log('user ID %i changed to team %i. room name "%s" room id: %i',
            session.user.userId, setTeamReq.newTeam, currentRoom.settings.roomName, currentRoom.id)

        return true
    }

    /**
     * called when the user (must be host) requests to start
     * counting down until the game starts
     * @param roomPacket the incoming packet
     * @param sourceConn the packet's source connection
     * @returns true if successful
     */
    private async onGameStartToggleRequest(roomPacket: InRoomPacket,
                                           sourceConn: ExtendedSocket): Promise<boolean> {
        const countdownReq: InRoomCountdown = new InRoomCountdown(roomPacket)

        const session: UserSession = sourceConn.session
        const currentRoom: Room = session.currentRoom

        if (currentRoom == null) {
            console.warn('user ID %i tried to toggle a room\'s game start countdown, although it isn\'t in any',
                session.user.userId)
            return false
        }

        if (session.user.userId !== currentRoom.host.userId) {
            console.warn('user ID %i tried to toggle a room\'s game start countdown, although it isn\'t the host.'
                + 'room name "%s" room id: %i',
                session.user.userId, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        const shouldCountdown: boolean = countdownReq.shouldCountdown()
        const count: number = countdownReq.count

        if (currentRoom.canStartGame() === false) {
            console.warn('user ID %i tried to toggle a room\'s game start countdown, although it can\'t start. '
                + 'room name "%s" room id: %i',
                session.user.userId, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        if (shouldCountdown) {
            currentRoom.progressCountdown(count)
            console.log('room "%s"\'s (id %i) countdown is at %i (host says it\'s at %i)',
                currentRoom.settings.roomName, currentRoom.id, currentRoom.getCountdown(), count)
        } else {
            currentRoom.stopCountdown()
            console.log('user ID %i canceled room "%s"\'s (id %i) countdown',
                session.user.userId, currentRoom.settings.roomName, currentRoom.id)
        }

        currentRoom.broadcastCountdown(shouldCountdown)

        return true
    }
}
