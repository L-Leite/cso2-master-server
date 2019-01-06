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

        // inform the host of the new user
        const hostSocket: ExtendedSocket = desiredRoom.host.socket
        const hostReply: Buffer = new OutRoomPacket(hostSocket.getSeq())
            .playerJoin(user, newTeam)
        hostSocket.send(hostReply)

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

        // inform every user in the room of the changes
        for (const guest of currentRoom.users) {
            if (guest === user) {
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
        const buf: Buffer = Buffer.from([0x55, 0x2C, 0x11, 0x01, 0x44, 0x65, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2C,
            0x00, 0x41, 0x4E, 0x00, 0x00, 0x01, 0x00, 0x1A, 0x00, 0x00, 0x00, 0x01, 0x00, 0x14, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x3B, 0x27, 0x00, 0x00, 0x01, 0x00, 0x40, 0x75, 0x00,
            0x00, 0x01, 0x00, 0x0B, 0x00, 0x00, 0x00, 0x01, 0x00, 0x11, 0x00, 0x00, 0x00, 0x01, 0x00, 0x05, 0x00,
            0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x0A, 0x00, 0x00, 0x00, 0x01, 0x00, 0x18,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x6A, 0x21, 0x00, 0x00, 0x02, 0x00, 0x42, 0x00, 0x00, 0x00, 0x01, 0x00,
            0x09, 0x00, 0x00, 0x00, 0x01, 0x00, 0x1C, 0x00, 0x00, 0x00, 0x01, 0x00, 0x43, 0x21, 0x00, 0x00, 0x01,
            0x00, 0x19, 0x00, 0x00, 0x00, 0x01, 0x00, 0x07, 0x00, 0x00, 0x00, 0x01, 0x00, 0x02, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x6C, 0xBF, 0x00, 0x00, 0x01, 0x00, 0x04, 0x00, 0x00,
            0x00, 0x01, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01, 0x00, 0x22, 0x00, 0x00, 0x00, 0x01, 0x00, 0x08, 0x00,
            0x00, 0x00, 0x01, 0x00, 0x24, 0x00, 0x00, 0x00, 0x01, 0x00, 0x71, 0xBF, 0x00, 0x00, 0x01, 0x00, 0x25,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x0D, 0x00, 0x00, 0x00, 0x01, 0x00, 0x0E, 0x00, 0x00, 0x00, 0x01, 0x00,
            0x0F, 0x00, 0x00, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0x00, 0x01, 0x00, 0x65, 0x00, 0x00, 0x00, 0x01,
            0x00, 0x12, 0x00, 0x00, 0x00, 0x01, 0x00, 0x13, 0x00, 0x00, 0x00, 0x01, 0x00, 0xE9, 0x03, 0x00, 0x00,
            0x01, 0x00, 0x15, 0x00, 0x00, 0x00, 0x01, 0x00, 0xEA, 0x03, 0x00, 0x00, 0x01, 0x00, 0xEB, 0x03, 0x00,
            0x00, 0x01, 0x00, 0x17, 0x00, 0x00, 0x00, 0x01, 0x00, 0x50, 0x00, 0x00, 0x00, 0x01, 0x00, 0xEC, 0x03,
            0x00, 0x00, 0x01, 0x00, 0x1B, 0x00, 0x00, 0x00, 0x01, 0x00])
        buf.writeUInt8(hostSocket.getSeq(), 1)
        hostSocket.send(buf)
        const buf2: Buffer = Buffer.from([0x55, 0x2D, 0x7A, 0x01, 0x44, 0x6F, 0x01, 0x01, 0x00, 0x00, 0x00, 0x71,
            0x01, 0x02, 0x09, 0x00, 0x02, 0x00, 0x00, 0x00, 0x01, 0x0F, 0x00, 0x00, 0x00, 0x02, 0x01, 0x00, 0x00,
            0x00, 0x03, 0x0A, 0x00, 0x00, 0x00, 0x04, 0x09, 0x00, 0x00, 0x00, 0x05, 0x18, 0x00, 0x00, 0x00, 0x06,
            0x00, 0x00, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x09, 0x00, 0x13,
            0x00, 0x00, 0x00, 0x01, 0x65, 0x00, 0x00, 0x00, 0x02, 0x05, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00,
            0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x07,
            0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x09, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01, 0x15,
            0x00, 0x00, 0x00, 0x02, 0x11, 0x00, 0x00, 0x00, 0x03, 0x0B, 0x00, 0x00, 0x00, 0x04, 0x1C, 0x00, 0x00,
            0x00, 0x05, 0x00, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x00, 0x08,
            0x00, 0x00, 0x00, 0x00, 0x09, 0x00, 0x0D, 0x00, 0x00, 0x00, 0x01, 0x0E, 0x00, 0x00, 0x00, 0x02, 0x1A,
            0x00, 0x00, 0x00, 0x03, 0x14, 0x00, 0x00, 0x00, 0x04, 0x80, 0x00, 0x00, 0x00, 0x05, 0x42, 0x00, 0x00,
            0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x09,
            0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x10, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x03, 0x00,
            0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00,
            0x00, 0x07, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x09, 0x00, 0x12, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00,
            0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00,
            0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x09, 0x00, 0x1B, 0x00, 0x00, 0x00, 0x01, 0x50, 0x00, 0x00, 0x00,
            0x02, 0x00, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00,
            0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00,
            0x00, 0x09, 0x00, 0x24, 0x00, 0x00, 0x00, 0x01, 0x25, 0x00, 0x00, 0x00, 0x02, 0x17, 0x00, 0x00, 0x00,
            0x03, 0x04, 0x00, 0x00, 0x00, 0x04, 0x08, 0x00, 0x00, 0x00, 0x05, 0x22, 0x00, 0x00, 0x00, 0x06, 0x00,
            0x00, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00])
        buf2.writeUInt8(hostSocket.getSeq(), 1)
        hostSocket.send(buf2)
        const buf3: Buffer = Buffer.from([0x55, 0x2E, 0x7F, 0x00, 0x44, 0x6B, 0x01, 0x00, 0x00, 0x00, 0x05, 0x00,
            0xEB, 0x03, 0x00, 0x00, 0x01, 0xEA, 0x03, 0x00, 0x00, 0x02, 0x3B, 0x27, 0x00, 0x00, 0x03, 0x40, 0x75,
            0x00, 0x00, 0x04, 0x41, 0x4E, 0x00, 0x00, 0x03, 0x06, 0x00, 0x42, 0x00, 0x00, 0x00, 0x01, 0x18, 0x00,
            0x00, 0x00, 0x02, 0x50, 0x00, 0x00, 0x00, 0x03, 0x04, 0x00, 0x00, 0x00, 0x04, 0x08, 0x00, 0x00, 0x00,
            0x05, 0x17, 0x00, 0x00, 0x00, 0x06, 0x00, 0x42, 0x00, 0x00, 0x00, 0x01, 0x18, 0x00, 0x00, 0x00, 0x02,
            0x50, 0x00, 0x00, 0x00, 0x03, 0x04, 0x00, 0x00, 0x00, 0x04, 0x08, 0x00, 0x00, 0x00, 0x05, 0x17, 0x00,
            0x00, 0x00, 0x06, 0x00, 0x10, 0x00, 0x00, 0x00, 0x01, 0x18, 0x00, 0x00, 0x00, 0x02, 0x50, 0x00, 0x00,
            0x00, 0x03, 0x04, 0x00, 0x00, 0x00, 0x04, 0x08, 0x00, 0x00, 0x00, 0x05, 0x17, 0x00, 0x00, 0x00, 0x00])
        buf3.writeUInt8(hostSocket.getSeq(), 1)
        hostSocket.send(buf3)
        const buf4: Buffer = Buffer.from([0x55, 0x30, 0x16, 0x00, 0x44, 0x6C, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
        buf4.writeUInt8(hostSocket.getSeq(), 1)
        hostSocket.send(buf4)
        const buf5: Buffer = Buffer.from([0x55, 0x31, 0x0A, 0x00, 0x44, 0x70, 0x01, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00])
        buf5.writeUInt8(hostSocket.getSeq(), 1)
        hostSocket.send(buf5)
        const buf6: Buffer = Buffer.from([0x55, 0x31, 0x0A, 0x00, 0x44, 0x70, 0x01, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00])
        buf6.writeUInt8(hostSocket.getSeq(), 1)
        hostSocket.send(buf6)

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

        if (countdown.shouldCountdown()) {
            console.log('room "%s"\'s (id %i) countdown is at %i',
                currentRoom.settings.roomName, currentRoom.id, countdown.count)
        } else {
            console.log('host "%s" canceled room "%s"\'s (id %i) countdown',
                user.userName, currentRoom.settings.roomName, currentRoom.id)
        }

        for (const roomUser of currentRoom.users) {
            const socket: ExtendedSocket = roomUser.socket
            let reply: Buffer = null

            if (countdown.shouldCountdown()) {
                currentRoom.progressCountdown(countdown.count)
                reply = new OutRoomPacket(socket.getSeq()).progressCountdown(countdown.count)
            } else {
                currentRoom.stopCountdown()
                reply = new OutRoomPacket(socket.getSeq()).stopCountdown()
            }

            socket.send(reply)
        }

        return true
    }
}
