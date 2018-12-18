import { Channel } from 'channel/channel'
import { ChannelServer } from 'channel/channelserver'

import { NewRoomSettings } from 'room/newroomsettings'
import { Room, RoomTeamNum } from 'room/room'
import { RoomSettings } from 'room/roomsettings'

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
            console.log('uuid ' + sourceSocket.uuid + ' tried to get channels without session')
            return false
        }

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
            console.log('uuid ' + sourceSocket.uuid + ' tried to get rooms without session')
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
        } else if (reqPacket.isUpdateSettings()) {
            return this.onRoomUpdateSettings(reqPacket, sourceSocket, user)
        } else if (reqPacket.isSetUserTeamRequest()) {
            return this.onSetTeamRequest(reqPacket, sourceSocket, user)
        } else if (reqPacket.isGameStartCountdownRequest()) {
            return this.onGameStartCountdownRequest(reqPacket, sourceSocket, user)
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
            console.log('uuid ' + sourceSocket.uuid + ' tried to get rooms without session')
            return false
        }

        const reqPacket: InRequestRoomListPacket = new InRequestRoomListPacket(reqData)

        const server: ChannelServer = this.getServerByIndex(reqPacket.channelServerIndex)

        if (server == null) {
            return false
        }

        const channel: Channel = server.getChannelByIndex(reqPacket.channelIndex)

        if (channel == null) {
            return false
        }

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
        const server: ChannelServer = this.getServerByIndex(user.currentChannelServerIndex)

        if (server == null) {
            return false
        }

        const channel: Channel = server.getChannelByIndex(user.currentChannelIndex)

        if (channel == null) {
            return false
        }

        const newRoom: Room = channel.createRoom(user, {
            gameModeId: reqPacket.newRequest.gameModeId,
            killLimit: reqPacket.newRequest.killLimit,
            mapId: reqPacket.newRequest.mapId,
            roomName: reqPacket.newRequest.roomName,
            winLimit: reqPacket.newRequest.winLimit,
        })

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
            return false
        }

        const channel: Channel = server.getChannelByIndex(user.currentChannelIndex)

        if (channel == null) {
            return false
        }

        const joinReq: InRoomJoinRequest = reqPacket.joinRequest
        const desiredRoom: Room = channel.getRoomById(joinReq.roomId)

        if (desiredRoom == null
            || desiredRoom.hasFreeSlots() === false) {
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
            return false
        }

        currentRoom.removeUser(user)
        user.currentRoom = null

        return true
    }

    /**
     * called when the user (must be host) requests to start the game
     * after the countdown is complete
     * @param reqPacket the parsed Room packet
     * @param hostSocket the user's socket
     * @param host the user itself
     * @returns true if successful
     */
    private onGameStartRequest(reqPacket: InRoomPacket, hostSocket: ExtendedSocket, host: User): boolean {
        const currentRoom: Room = host.currentRoom

        if (currentRoom == null || host !== currentRoom.host) {
            return false
        }

        // inform every user in the room of the changes
        for (const guest of currentRoom.users) {
            if (guest === host) {
                continue
            }

            const guestSocket: ExtendedSocket = guest.socket

            const hostUdpData: Buffer = new OutUdpPacket(1, host.userId,
                host.externalIpAddress, host.externalServerPort, guestSocket.getSeq()).build()
            const guestReply: Buffer = new OutHostPacket(guestSocket.getSeq()).joinHost(host.userId)
            guestSocket.send(hostUdpData)
            guestSocket.send(guestReply)

            const guestData = new OutUdpPacket(0, guest.userId,
                guest.externalIpAddress, guest.externalClientPort, hostSocket.getSeq()).build()
            hostSocket.send(guestData)
        }

        const matchStart: Buffer =
            new OutHostPacket(hostSocket.getSeq()).gameStart(host.userId)
        hostSocket.send(matchStart)

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

        if (currentRoom == null || user !== currentRoom.host) {
            return false
        }

        const newSettings: NewRoomSettings = NewRoomSettings.from(reqPacket.updateSettings)
        currentRoom.settings.update(newSettings)

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
            return false
        }

        const swap: InRoomSetUserTeamRequest = reqPacket.swapTeam
        currentRoom.setUserToTeam(user, swap.newTeam)

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
    private onGameStartCountdownRequest(reqPacket: InRoomPacket, sourceSocket: ExtendedSocket, user: User): boolean {
        const currentRoom: Room = user.currentRoom

        if (currentRoom == null || user !== currentRoom.host) {
            return false
        }

        const countdown: InRoomCountdown = reqPacket.countdown

        for (const roomUser of currentRoom.users) {
            const socket: ExtendedSocket = roomUser.socket
            let reply: Buffer = null

            if (countdown.shouldCountdown()) {
                reply = new OutRoomPacket(socket.getSeq()).progressCountdown(countdown.count)
            } else {
                reply = new OutRoomPacket(socket.getSeq()).stopCountdown()
            }

            socket.send(reply)
        }

        return true
    }
}
