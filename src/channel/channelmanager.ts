import { Channel } from 'channel/channel'
import { ChannelServer } from 'channel/channelserver'

import { NewRoomSettings } from 'room/newroomsettings'
import { Room, RoomReadyStatus, RoomTeamNum } from 'room/room'

import { User } from 'user/user'
import { UserManager } from 'user/usermanager'

import { ExtendedSocket } from 'extendedsocket'

import { InRequestRoomListPacket } from 'packets/in/requestroomlist'
import { InRoomPacket } from 'packets/in/room'
import { InRoomCountdown } from 'packets/in/room/countdown'
import { InRoomJoinRequest } from 'packets/in/room/joinrequest'
import { InRoomSetUserTeamRequest } from 'packets/in/room/setuserteamreq'
import { OutHostPacket } from 'packets/out/host'
import { OutLobbyPacket } from 'packets/out/lobby'
import { OutRoomPacket } from 'packets/out/room'
import { OutRoomListPacket } from 'packets/out/roomlist'
import { OutServerListPacket } from 'packets/out/serverlist'
import { OutUdpPacket } from 'packets/out/udp'

/**
 * stores the channel servers and processes their data
 * @class ChannelManager
 */
export class ChannelManager {
    private channelServers: ChannelServer[]

    constructor() {
        this.channelServers = [new ChannelServer('Test server', 1, 1, 1)]
    }

    /**
     * called when the user sends a RequestChannels packet
     * @param sourceSocket the user's socket
     * @param users the user manager object
     */
    public onChannelListPacket(sourceSocket: ExtendedSocket, users: UserManager): boolean {
        if (users.isUuidLoggedIn(sourceSocket.uuid) === false) {
            console.warn('uuid "%s" tried to get channels without session', sourceSocket.uuid)
            return false
        }

        const user: User = users.getUserByUuid(sourceSocket.uuid)
        console.log('user "%s" requested server list, sending...', user.userName)

        const reply: Buffer = this.buildServerListPacket(sourceSocket.getSeq())
        sourceSocket.send(reply)
        return true
    }

    /**
     * called when the user sends a Room packet
     * @param reqData the packet's data
     * @param sourceSocket the user's socket
     * @param users the user manager object
     */
    public onRoomRequest(reqData: Buffer, sourceSocket: ExtendedSocket, users: UserManager): boolean {
        const user: User = users.getUserByUuid(sourceSocket.uuid)

        if (user == null) {
            console.warn('uuid "%s" tried to get rooms without session', sourceSocket.uuid)
            return false
        }

        const reqPacket: InRoomPacket = new InRoomPacket(reqData)

        if (reqPacket.isNewRoomRequest()) {
            return this.onNewRoomRequest(reqPacket, sourceSocket, user)
        } else if (reqPacket.isJoinRoomRequest()) {
            return this.onJoinRoomRequest(reqPacket, sourceSocket, user)
        } else if (reqPacket.isGameStartRequest()) {
            return this.onGameStartRequest(reqPacket, sourceSocket, user)
        } else if (reqPacket.isLeaveRoomRequest()) {
            return this.onLeaveRoomRequest(reqPacket, sourceSocket, user)
        } else if (reqPacket.isToggleReadyRequest()) {
            return this.onToggleReadyRequest(reqPacket, sourceSocket, user)
        } else if (reqPacket.isUpdateSettings()) {
            return this.onRoomUpdateSettings(reqPacket, sourceSocket, user)
        } else if (reqPacket.isSetUserTeamRequest()) {
            return this.onSetTeamRequest(reqPacket, sourceSocket, user)
        } else if (reqPacket.isGameStartCountdownRequest()) {
            return this.onGameStartToggleRequest(reqPacket, sourceSocket, user)
        } else {
            console.warn('Unknown room request %i', reqPacket.packetType)
        }

        return true
    }

    /**
     * called when the user sends a RequestRoomList packet
     * @param reqData the packet's data
     * @param sourceSocket the user's socket
     * @param users the user manager object
     */
    public onRoomListPacket(reqData: Buffer, sourceSocket: ExtendedSocket, users: UserManager): boolean {
        const user: User = users.getUserByUuid(sourceSocket.uuid)

        if (user == null) {
            console.warn('uuid "%s" tried to get rooms without session', sourceSocket.uuid)
            return false
        }

        const reqPacket: InRequestRoomListPacket = new InRequestRoomListPacket(reqData)

        const server: ChannelServer = this.getServerByIndex(reqPacket.channelServerIndex)

        if (server == null) {
            console.warn('user "%s" requested room list, but it isn\'t in a channel server', user.userName)
            return false
        }

        const channel: Channel = server.getChannelByIndex(reqPacket.channelIndex)

        if (channel == null) {
            console.warn('user "%s" requested room list, but it isn\'t in a channel', user.userName)
            return false
        }

        console.log('user "%s" requested room list successfully, sending...', user.userName)

        user.setCurrentChannel(reqPacket.channelServerIndex, reqPacket.channelIndex)

        const lobbyReply: Buffer = new OutLobbyPacket(sourceSocket.getSeq()).joinRoom()
        const roomListReply: Buffer = new OutRoomListPacket(sourceSocket.getSeq()).getFullList(channel.rooms)
        sourceSocket.send(lobbyReply)
        sourceSocket.send(roomListReply)

        return true
    }

    /**
     * build channel servers list data for the user
     * @param seq the socket's next sequence
     */
    public buildServerListPacket(seq: number): Buffer {
        const packet: OutServerListPacket =
            new OutServerListPacket(seq, this.channelServers)
        return packet.build()
    }

    /**
     * get a channel server by its index
     * @param index the server index
     */
    private getServerByIndex(index: number): ChannelServer {
        for (const server of this.channelServers) {
            if (server.index === index) {
                return server
            }
        }
        return null
    }

    /**
     * called when the user requests to create a new room
     * @param reqPacket the parsed Room packet
     * @param sourceSocket the user's socket
     * @param user the user itself
     * @returns true if successful
     */
    private onNewRoomRequest(reqPacket: InRoomPacket, sourceSocket: ExtendedSocket, user: User): boolean {
        // don't allow the user to create a new room while in another one
        if (user.currentRoom) {
            console.warn('user "%s" tried to create a new room, while in an existing one'
                + 'current room: "%s" (id: %i)', user.userName, user.currentRoom.settings.roomName, user.currentRoom.id)
            return false
        }

        const server: ChannelServer = this.getServerByIndex(user.currentChannelServerIndex)

        if (server == null) {
            console.warn('user "%s" requested a new room, but it isn\'t in a channel server', user.userName)
            return false
        }

        const channel: Channel = server.getChannelByIndex(user.currentChannelIndex)

        if (channel == null) {
            console.warn('user "%s" requested a new room, but it isn\'t in a channel', user.userName)
            return false
        }

        const newRoom: Room = channel.createRoom(user, {
            gameModeId: reqPacket.newRequest.gameModeId,
            killLimit: reqPacket.newRequest.killLimit,
            mapId: reqPacket.newRequest.mapId,
            roomName: reqPacket.newRequest.roomName,
            winLimit: reqPacket.newRequest.winLimit,
        })

        console.log('user "%s" requested a new room. room name: "%s" room id: %i',
            user.userName, newRoom.settings.roomName, newRoom.id)

        user.currentRoom = newRoom

        const reply: Buffer = new OutRoomPacket(sourceSocket.getSeq()).createAndJoin(newRoom)
        sourceSocket.send(reply)

        this.sendUserRoomSettings(user, newRoom)

        return true
    }

    /**
     * called when the user requests to join an existing room
     * @param reqPacket the parsed Room packet
     * @param sourceSocket the user's socket
     * @param user the user itself
     * @returns true if successful
     */
    private onJoinRoomRequest(reqPacket: InRoomPacket, sourceSocket: ExtendedSocket, user: User): boolean {
        const server: ChannelServer = this.getServerByIndex(user.currentChannelServerIndex)

        if (server == null) {
            console.warn('user "%s" tried to join a room, but it isn\'t in a channel server', user.userName)
            return false
        }

        const channel: Channel = server.getChannelByIndex(user.currentChannelIndex)

        if (channel == null) {
            console.warn('user "%s" tried to join a room, but it isn\'t in a channel', user.userName)
            return false
        }

        const joinReq: InRoomJoinRequest = reqPacket.joinRequest
        const desiredRoom: Room = channel.getRoomById(joinReq.roomId)

        if (desiredRoom == null) {
            console.warn('user "%s" tried to join a non existing room. room id: %i',
                user.userName, joinReq.roomId)
            return false
        }

        if (desiredRoom.hasFreeSlots() === false) {
            console.warn('user "%s" tried to join a full room. room name "%s" room id: %i',
                user.userName, desiredRoom.settings.roomName, desiredRoom.id)
            return false
        }

        const newTeam: RoomTeamNum = desiredRoom.findDesirableTeamNum()

        desiredRoom.addUser(user, newTeam)
        user.currentRoom = desiredRoom

        const reply: Buffer = new OutRoomPacket(sourceSocket.getSeq()).createAndJoin(desiredRoom)
        sourceSocket.send(reply)

        this.sendUserRoomSettings(user, desiredRoom)

        // inform users of the new player
        for (const player of desiredRoom.users) {
            if (player === user) {
                continue
            }

            // tell the new user who's ready
            const readyStatus = desiredRoom.getUserReadyStatus(player)
            const readyReply: Buffer = new OutRoomPacket(user.socket.getSeq())
                .setUserReadyStatus(user, readyStatus)
            user.socket.send(readyReply)

            // inform users of the new player
            const playerSocket: ExtendedSocket = player.socket
            const playerReply: Buffer = new OutRoomPacket(playerSocket.getSeq())
                .playerJoin(user, newTeam)
            playerSocket.send(playerReply)
        }

        console.log('user "%s" joined a new room. room name: "%s" room id: %i',
            user.userName, desiredRoom.settings.roomName, desiredRoom.id)

        return true
    }

    /**
     * called when the user requests to leave the current room its in
     * @param reqPacket the parsed Room packet
     * @param sourceSocket the user's socket
     * @param user the user itself
     * @returns true if successful
     */
    private onLeaveRoomRequest(reqPacket: InRoomPacket, sourceSocket: ExtendedSocket, user: User): boolean {
        const currentRoom: Room = user.currentRoom

        if (currentRoom == null) {
            console.warn('user "%s" tried to leave a room, although it isn\'t in any', user.userName)
            return false
        }

        if (currentRoom.isUserReady(user)
            && currentRoom.isCountdownInProgress()) {
            return false
        }

        console.log('user "%s" left a room. room name: "%s" room id: %i',
            user.userName, currentRoom.settings.roomName, currentRoom.id)

        currentRoom.removeUser(user)
        user.currentRoom = null

        return true
    }

    /**
     * called when the user requests to toggle ready status
     * @param sourceSocket the user's socket
     * @param user the user itself
     * @returns true if successful
     */
    private onToggleReadyRequest(reqPacket: InRoomPacket, sourceSocket: ExtendedSocket, user: User): boolean {
        const currentRoom: Room = user.currentRoom

        if (currentRoom == null) {
            console.warn('user "%s" tried toggle ready status, although it isn\'t in any', user.userName)
            return false
        }

        if (currentRoom.isCountdownInProgress()) {
            console.warn('user "%s" tried toggle ready status, although it isn\'t in any', user.userName)
            return false
        }

        const readyStatus: RoomReadyStatus = currentRoom.toggleUserReadyStatus(user)

        if (readyStatus === RoomReadyStatus.Yes) {
            console.log('user "%s" readied in room "%s" (id %i)',
                user.userName, currentRoom.settings.roomName, currentRoom.id)
        } else if (readyStatus === RoomReadyStatus.No) {
            console.log('user "%s" unreadied in room "%s" (id %i)',
                user.userName, currentRoom.settings.roomName, currentRoom.id)
        } else {
            console.log('user "%s" did something with ready status. status: %i room \""%s"\" (id %i)',
                user.userName, readyStatus, currentRoom.settings.roomName, currentRoom.id)
        }

        // inform every user in the room of the changes
        for (const player of currentRoom.users) {
            const playerSocket: ExtendedSocket = player.socket
            const reply: Buffer = new OutRoomPacket(playerSocket.getSeq())
                .setUserReadyStatus(user, readyStatus)
            playerSocket.send(reply)
        }

        return true
    }

    /**
     * called when the user (must be host) requests to start the game
     * after the countdown is complete
     * @param reqPacket the parsed Room packet
     * @param hostSocket the user's socket
     * @param user the user itself
     * @returns true if successful
     */
    private onGameStartRequest(reqPacket: InRoomPacket, hostSocket: ExtendedSocket, user: User): boolean {
        const currentRoom: Room = user.currentRoom

        if (currentRoom == null) {
            console.warn('user "%s" tried to start a room\'s match, although it isn\'t in any', user.userName)
            return false
        }

        if (user !== currentRoom.host) {
            console.warn('user "%s" tried to start a room\'s match, although it isn\'t the host.'
                + 'room name "%s" room id: %i',
                user.userName, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        // tell the ready users to join the host
        for (const guest of currentRoom.users) {
            // 'user' is the host, don't tell it to join itself
            if (guest === user) {
                continue
            }

            // don't tell users to join if they're not ready
            if (currentRoom.isUserReady(guest) === false) {
                continue
            }

            const guestSocket: ExtendedSocket = guest.socket

            const hostUdpData: Buffer = new OutUdpPacket(1, user.userId,
                user.externalIpAddress, user.externalServerPort, guestSocket.getSeq()).build()
            const guestReply: Buffer = new OutHostPacket(guestSocket.getSeq()).joinHost(user.userId)
            guestSocket.send(hostUdpData)
            guestSocket.send(guestReply)

            const guestData = new OutUdpPacket(0, guest.userId,
                guest.externalIpAddress, guest.externalClientPort, hostSocket.getSeq()).build()
            hostSocket.send(guestData)
        }

        const matchStart: Buffer =
            new OutHostPacket(hostSocket.getSeq()).gameStart(user.userId)
        hostSocket.send(matchStart)

        console.log('host "%s" started room "%s"\'s (id: %i) match on map %i and gamemode %i',
            user.userName, currentRoom.settings.roomName, currentRoom.id,
            currentRoom.settings.mapId, currentRoom.settings.gameModeId)

        return true
    }

    /**
     * called when the user requests to update its current room settings
     * @param reqPacket the parsed Room packet
     * @param sourceSocket the user's socket
     * @param user the user itself
     * @returns true if successful
     */
    private onRoomUpdateSettings(reqPacket: InRoomPacket, sourceSocket: ExtendedSocket, user: User): boolean {
        const currentRoom: Room = user.currentRoom

        if (currentRoom == null) {
            console.warn('user "%s" tried to update a room\'s settings, although it isn\'t in any', user.userName)
            return false
        }

        if (user !== currentRoom.host) {
            console.warn('user "%s" tried to update a room\'s settings, although it isn\'t the host.'
                + 'room name "%s" room id: %i',
                user.userName, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        if (currentRoom.isCountdownInProgress()) {
            console.warn('user "%s" tried to update a room\'s settings, although a countdown is in progress.'
                + 'room name "%s" room id: %i',
                user.userName, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        const newSettings: NewRoomSettings = NewRoomSettings.from(reqPacket.updateSettings)
        currentRoom.settings.update(newSettings)

        console.log('host "%s" updated room "%s"\'s settings (id: %i)',
            user.userName, currentRoom.settings.roomName, currentRoom.id)

        // inform every user in the room of the changes
        for (const player of currentRoom.users) {
            const playerSocket: ExtendedSocket = player.socket
            const reply: Buffer = new OutRoomPacket(playerSocket.getSeq()).updateSettings(newSettings)
            playerSocket.send(reply)
        }

        return true
    }

    private sendUserRoomSettings(user: User, room: Room): void {
        const newSettings: NewRoomSettings = NewRoomSettings.fromRoom(room)

        const reply: Buffer = new OutRoomPacket(user.socket.getSeq()).updateSettings(newSettings)
        user.socket.send(reply)
    }

    /**
     * called when the user requests to change team
     * @param reqPacket the parsed Room packet
     * @param sourceSocket the user's socket
     * @param user the user itself
     * @returns true if successful
     */
    private onSetTeamRequest(reqPacket: InRoomPacket, sourceSocket: ExtendedSocket, user: User): boolean {
        const currentRoom: Room = user.currentRoom

        if (currentRoom == null) {
            console.warn('user "%s" tried change team in a room, although it isn\'t in any', user.userName)
            return false
        }

        if (currentRoom.isUserReady(user)) {
            console.warn('user "%s" tried change team in a room, although it\'s ready. room name "%s" room id: %i',
                user.userName, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        const swap: InRoomSetUserTeamRequest = reqPacket.swapTeam
        currentRoom.setUserToTeam(user, swap.newTeam)

        console.log('user "%s" changed to team %i. room name "%s" room id: %i',
            user.userName, swap.newTeam, currentRoom.settings.roomName, currentRoom.id)

        // inform every user in the room of the changes
        for (const player of currentRoom.users) {
            const playerSocket: ExtendedSocket = player.socket
            const reply: Buffer = new OutRoomPacket(playerSocket.getSeq()).setUserTeam(user, swap.newTeam)
            playerSocket.send(reply)
        }

        return true
    }

    /**
     * called when the user (must be host) requests to start
     * counting down until the game starts
     * @param reqPacket the parsed Room packet
     * @param sourceSocket the user's socket
     * @param user the user itself
     * @returns true if successful
     */
    private onGameStartToggleRequest(reqPacket: InRoomPacket, sourceSocket: ExtendedSocket, user: User): boolean {
        const currentRoom: Room = user.currentRoom

        if (currentRoom == null) {
            console.warn('user "%s" tried to toggle a room\'s game start countdown, although it isn\'t in any',
                user.userName)
            return false
        }

        if (user !== currentRoom.host) {
            console.warn('user "%s" tried to toggle a room\'s game start countdown, although it isn\'t the host.'
                + 'room name "%s" room id: %i',
                user.userName, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        if (currentRoom.canStartGame() === false) {
            console.warn('user "%s" tried to toggle a room\'s game start countdown, although it can\'t start. '
                + 'room name "%s" room id: %i',
                user.userName, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        const countdown: InRoomCountdown = reqPacket.countdown
        let nextCountdown: number = 0

        if (countdown.shouldCountdown()) {
            console.log('room "%s"\'s (id %i) countdown is at %i (host says it\'s at %i)',
                currentRoom.settings.roomName, currentRoom.id, currentRoom.getCountdown(), countdown.count)
            nextCountdown = currentRoom.progressCountdown(countdown.count)
        } else {
            console.log('host "%s" canceled room "%s"\'s (id %i) countdown',
                user.userName, currentRoom.settings.roomName, currentRoom.id)
            currentRoom.stopCountdown()
        }

        for (const roomUser of currentRoom.users) {
            const socket: ExtendedSocket = roomUser.socket
            let reply: Buffer = null

            if (countdown.shouldCountdown()) {
                reply = new OutRoomPacket(socket.getSeq()).progressCountdown(nextCountdown)
            } else {
                reply = new OutRoomPacket(socket.getSeq()).stopCountdown()
            }

            socket.send(reply)
        }

        return true
    }
}
