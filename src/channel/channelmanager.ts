import { Channel } from 'channel/channel'
import { ChannelServer } from 'channel/channelserver'

import { Room } from 'room/room'

import { User } from 'user/user'
import { UserManager } from 'user/usermanager'

import { ExtendedSocket } from 'extendedsocket'

import { InRequestRoomListPacket } from 'packets/in/requestroomlist'
import { InRoomPacket } from 'packets/in/room'
import { InRoomCountdown } from 'packets/in/room/countdown'
import { InRoomJoinRequest } from 'packets/in/room/joinrequest'
import { InRoomSwapTeamRequest } from 'packets/in/room/swapteam'
import { InRoomUpdateSettings } from 'packets/in/room/updatesettings'
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
        sourceSocket.write(reply)
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

        const lobbyReply: Buffer = new OutLobbyPacket(sourceSocket.getSeq()).doSomething()
        const roomListReply: Buffer = new OutRoomListPacket(sourceSocket.getSeq()).getFullList(channel.rooms)
        sourceSocket.write(lobbyReply)
        sourceSocket.write(roomListReply)

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
        } else if (reqPacket.isSwapTeamRequest()) {
            return this.onSwapTeamRequest(reqPacket, sourceSocket, user)
        } else if (reqPacket.isGameStartCountdownRequest()) {
            return this.onGameStartCountdownRequest(reqPacket, sourceSocket, user)
        }

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
        sourceSocket.write(reply)

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

        desiredRoom.addUser(user)
        user.currentRoom = desiredRoom

        const reply: Buffer = new OutRoomPacket(sourceSocket.getSeq()).createAndJoin(desiredRoom)
        sourceSocket.write(reply)

        // inform the host of the new user
        const hostSocket: ExtendedSocket = desiredRoom.host.socket
        const hostReply: Buffer = new OutRoomPacket(hostSocket.getSeq()).playerJoin(user)
        hostSocket.write(hostReply)

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
            guestSocket.write(hostUdpData)
            guestSocket.write(guestReply)

            const guestData = new OutUdpPacket(0, guest.userId,
                guest.externalIpAddress, guest.externalClientPort, hostSocket.getSeq()).build()
            hostSocket.write(guestData)
        }

        const matchStart: Buffer =
            new OutHostPacket(hostSocket.getSeq()).gameStart(host.userId)
        hostSocket.write(matchStart)

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

        const newSettings: InRoomUpdateSettings = reqPacket.updateSettings

        if (newSettings.roomName) {
            currentRoom.roomName = newSettings.roomName
        }
        if (newSettings.gameModeId) {
            currentRoom.gameModeId = newSettings.gameModeId
        }
        if (newSettings.mapId) {
            currentRoom.mapId = newSettings.mapId
        }
        if (newSettings.killLimit) {
            currentRoom.killLimit = newSettings.killLimit
        }
        if (newSettings.winLimit) {
            currentRoom.winLimit = newSettings.winLimit
        }
        if (newSettings.startMoney) {
            currentRoom.startMoney = newSettings.startMoney
        }

        if (newSettings.maxPlayers) {
            currentRoom.maxPlayers = newSettings.maxPlayers
        }
        if (newSettings.respawnTime) {
            currentRoom.respawnTime = newSettings.respawnTime
        }
        if (newSettings.changeTeams) {
            currentRoom.changeTeams = newSettings.changeTeams
        }
        if (newSettings.forceCamera) {
            currentRoom.forceCamera = newSettings.forceCamera
        }
        if (newSettings.teamBalance) {
            currentRoom.teamBalance = newSettings.teamBalance
        }
        if (newSettings.weaponRestrictions) {
            currentRoom.weaponRestrictions = newSettings.weaponRestrictions
        }
        if (newSettings.hltvEnabled) {
            currentRoom.hltvEnabled = newSettings.hltvEnabled
        }

        // inform every user in the room of the changes
        for (const player of currentRoom.users) {
            const playerSocket: ExtendedSocket = player.socket
            const reply: Buffer = new OutRoomPacket(playerSocket.getSeq()).updateSettings(newSettings)
            playerSocket.write(reply)
        }

        return true
    }

    /**
     * called when the user requests to change team
     * @param reqPacket the parsed Room packet
     * @param sourceSocket the user's socket
     * @param user the user itself
     * @returns true if successful
     */
    private onSwapTeamRequest(reqPacket: InRoomPacket, sourceSocket: ExtendedSocket, user: User): boolean {
        const currentRoom: Room = user.currentRoom

        if (currentRoom == null) {
            return false
        }

        const swap: InRoomSwapTeamRequest = reqPacket.swapTeam

        // inform every user in the room of the changes
        for (const player of currentRoom.users) {
            const playerSocket: ExtendedSocket = player.socket
            const reply: Buffer = new OutRoomPacket(playerSocket.getSeq()).swapTeam(swap.newTeam)
            playerSocket.write(reply)
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

        const reply: Buffer = new OutRoomPacket(sourceSocket.getSeq()).countdown(countdown.count)
        sourceSocket.write(reply)

        return true
    }
}
