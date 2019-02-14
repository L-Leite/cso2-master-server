import { Channel } from 'channel/channel'
import { ChannelServer } from 'channel/channelserver'

import { Room, RoomReadyStatus, RoomStatus } from 'room/room'

import { User } from 'user/user'
import { UserManager } from 'user/usermanager'

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
        const user: User = users.getUserByUuid(sourceSocket.uuid)

        if (user == null) {
            console.warn('uuid "%s" tried to get channels without session', sourceSocket.uuid)
            return false
        }

        console.log('user "%s" requested server list, sending...', user.userName)
        this.sendChannelListTo(user)

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

        const roomPacket: InRoomPacket = new InRoomPacket(reqData)

        switch (roomPacket.packetType) {
            case InRoomType.NewRoomRequest:
                const newRoomReq: InRoomNewRequest = new InRoomNewRequest(roomPacket)
                return this.onNewRoomRequest(newRoomReq, user)
            case InRoomType.JoinRoomRequest:
                const joinReq: InRoomJoinRequest = new InRoomJoinRequest(roomPacket)
                return this.onJoinRoomRequest(joinReq, user)
            case InRoomType.GameStartRequest:
                return this.onGameStartRequest(user)
            case InRoomType.LeaveRoomRequest:
                return this.onLeaveRoomRequest(user)
            case InRoomType.ToggleReadyRequest:
                return this.onToggleReadyRequest(user)
            case InRoomType.UpdateSettings:
                const newSettingsReq: InRoomUpdateSettings = new InRoomUpdateSettings(roomPacket)
                return this.onRoomUpdateSettings(newSettingsReq, user)
            case InRoomType.OnCloseResultWindow:
                return this.onCloseResultRequest(user)
            case InRoomType.SetUserTeamRequest:
                const setTeamReq: InRoomSetUserTeamRequest = new InRoomSetUserTeamRequest(roomPacket)
                return this.onSetTeamRequest(setTeamReq, user)
            case InRoomType.GameStartCountdownRequest:
                const countdownReq: InRoomCountdown = new InRoomCountdown(roomPacket)
                return this.onGameStartToggleRequest(countdownReq, user)
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
    public onRoomListPacket(packetData: Buffer, sourceSocket: ExtendedSocket, users: UserManager): boolean {
        const user: User = users.getUserByUuid(sourceSocket.uuid)

        if (user == null) {
            console.warn('uuid "%s" tried to get rooms without session', sourceSocket.uuid)
            return false
        }

        const listReq: InRequestRoomListPacket = new InRequestRoomListPacket(packetData)

        const server: ChannelServer = this.getServerByIndex(listReq.channelServerIndex)

        if (server == null) {
            console.warn('user "%s" requested room list, but it isn\'t in a channel server', user.userName)
            return false
        }

        const channel: Channel = server.getChannelByIndex(listReq.channelIndex)

        if (channel == null) {
            console.warn('user "%s" requested room list, but it isn\'t in a channel', user.userName)
            return false
        }

        console.log('user "%s" requested room list successfully, sending it...', user.userName)
        this.setUserChannel(user, channel, server)

        return true
    }

    /**
     * send the channel servers list data for the user
     * @param user the target user
     */
    public sendChannelListTo(user: User): void {
        const list: Buffer =
            new OutServerListPacket(this.channelServers, user.socket).build()
        user.socket.send(list)
    }

    public sendRoomListTo(user: User, channel: Channel): void {
        const lobbyReply: Buffer = new OutLobbyPacket(user.socket).joinRoom()
        const roomListReply: Buffer = new OutRoomListPacket(user.socket).getFullList(channel.rooms)
        user.socket.send(lobbyReply)
        user.socket.send(roomListReply)
    }

    /**
     * sets an user's current channel
     * @param user the target user
     * @param channel the target channel
     * @param channelServer the channel's channelServer
     */
    private setUserChannel(user: User, channel: Channel, channelServer: ChannelServer) {
        user.setCurrentChannelIndex(channelServer.index, channel.index)
        this.sendRoomListTo(user, channel)
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
     * returns a channel object by its channel index and channel server index
     * @param channelIndex the channel's index
     * @param channelServerIndex the channel's channel server index
     */
    private getChannel(channelIndex: number, channelServerIndex: number): Channel {
        return this.getServerByIndex(channelServerIndex).getChannelByIndex(channelIndex)
    }

    /**
     * called when the user requests to create a new room
     * @param newRoomReq the parsed Room packet
     * @param user the user itself
     * @returns true if successful
     */
    private onNewRoomRequest(newRoomReq: InRoomNewRequest, user: User): boolean {
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
            gameModeId: newRoomReq.gameModeId,
            killLimit: newRoomReq.killLimit,
            mapId: newRoomReq.mapId,
            roomName: newRoomReq.roomName,
            winLimit: newRoomReq.winLimit,
        })

        user.currentRoom = newRoom

        newRoom.sendJoinNewRoom(user)
        newRoom.sendRoomSettingsTo(user)

        console.log('user "%s" created a new room. name: "%s" (id: %i)',
            user.userName, newRoom.settings.roomName, newRoom.id)

        return true
    }

    /**
     * called when the user requests to join an existing room
     * @param joinReq the parsed Room packet
     * @param user the user itself
     * @returns true if successful
     */
    private onJoinRoomRequest(joinReq: InRoomJoinRequest, user: User): boolean {
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

        desiredRoom.addUser(user)
        user.currentRoom = desiredRoom

        desiredRoom.sendJoinNewRoom(user)
        desiredRoom.sendRoomSettingsTo(user)

        // tell other room members about the new addition
        desiredRoom.recurseUsers((u: User): void => {
            if (u !== user) {
                desiredRoom.sendPlayerReadyStatusTo(user, u)
                desiredRoom.sendNewUserTo(u, user)
            }
        })

        console.log('user "%s" joined a new room. room name: "%s" room id: %i',
                    user.userName, desiredRoom.settings.roomName, desiredRoom.id)

        return true
    }

    /**
     * called when the user requests to leave the current room its in
     * @param user the user itself
     * @returns true if successful
     */
    private onLeaveRoomRequest(user: User): boolean {
        const currentRoom: Room = user.currentRoom

        if (currentRoom == null) {
            console.warn('user "%s" tried to leave a room, although it isn\'t in any', user.userName)
            return false
        }

        if (currentRoom.isUserReady(user)
            && currentRoom.isGlobalCountdownInProgress()) {
            return false
        }

        currentRoom.removeUser(user)
        user.currentRoom = null

        console.log('user "%s" left a room. room name: "%s" room id: %i',
            user.userName, currentRoom.settings.roomName, currentRoom.id)

        this.sendRoomListTo(user,
            this.getChannel(user.currentChannelIndex, user.currentChannelServerIndex))

        return true
    }

    /**
     * called when the user requests to toggle ready status
     * @param user the user itself
     * @returns true if successful
     */
    private onToggleReadyRequest(user: User): boolean {
        const currentRoom: Room = user.currentRoom

        if (currentRoom == null) {
            console.warn('user "%s" tried toggle ready status, although it isn\'t in any', user.userName)
            return false
        }

        if (currentRoom.isGlobalCountdownInProgress()) {
            console.warn('user "%s" tried toggle ready status, although it isn\'t in any', user.userName)
            return false
        }

        const readyStatus: RoomReadyStatus = currentRoom.toggleUserReadyStatus(user)

        if (readyStatus == null) {
            console.warn('failed to set user "%s"\'sready status', user.userName)
            return false
        }

        // inform every user in the room of the changes
        currentRoom.recurseUsers((u: User): void => {
            currentRoom.sendUserReadyStatusTo(u, user)
        })

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

        return true
    }

    /**
     * called when the user (must be host) requests to start the game
     * after the countdown is complete
     * @param user the user itself
     * @returns true if successful
     */
    private onGameStartRequest(user: User): boolean {
        const currentRoom: Room = user.currentRoom

        if (currentRoom == null) {
            console.warn('user "%s" tried to start a room\'s match, although it isn\'t in any', user.userName)
            return false
        }

        // if started by the host
        if (user === currentRoom.host) {
            this.handleHostGameStart(currentRoom)
            return true
        } else if (currentRoom.getStatus() === RoomStatus.Ingame) {
            this.handleUserGameStart(user, currentRoom)
            return true
        }

        console.warn('user "%s" tried to start a room\'s match, although it isn\'t the host.'
            + 'room name "%s" room id: %i',
            user.userName, currentRoom.settings.roomName, currentRoom.id)

        return false
    }

    private handleHostGameStart(room: Room): void {
        const host: User = room.host

        room.stopCountdown()
        room.setStatus(RoomStatus.Ingame)

        room.recurseNonHostUsers((u: User): void => {
            if (room.isUserReady(u) === true) {
                room.sendConnectHostTo(u, host)
                room.sendGuestDataTo(host, u)
            }
        })

        room.sendStartMatchTo(host)

        console.log('host "%s" started room "%s"\'s (id: %i) match on map %i and gamemode %i',
            host.userName, room.settings.roomName, room.id,
            room.settings.mapId, room.settings.gameModeId)
    }

    private handleUserGameStart(user: User, room: Room): void {
        const host: User = room.host

        room.sendConnectHostTo(user, host)
        room.sendGuestDataTo(host, user)

        console.log('user "%s" joining room "%s"\'(id: %i) match hosted by "%s" on map %i and gamemode %i',
            user.userName, room.settings.roomName, room.id, host.userName,
            room.settings.mapId, room.settings.gameModeId)
    }

    /**
     * called when the user requests to update its current room settings
     * @param newSettingsReq the parsed Room packet
     * @param user the user itself
     * @returns true if successful
     */
    private onRoomUpdateSettings(newSettingsReq: InRoomUpdateSettings, user: User): boolean {
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

        if (currentRoom.isGlobalCountdownInProgress()) {
            console.warn('user "%s" tried to update a room\'s settings, although a countdown is in progress.'
                + 'room name "%s" room id: %i',
                user.userName, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        currentRoom.updateSettings(newSettingsReq)

        // inform every user in the room of the changes
        currentRoom.recurseUsers((u: User): void => {
            currentRoom.sendRoomSettingsTo(u)
        })

        console.log('host "%s" updated room "%s"\'s settings (id: %i)',
            user.userName, currentRoom.settings.roomName, currentRoom.id)

        return true
    }

    /**
     * called when the user requests to update its current room settings
     * @param user the user itself
     * @returns true if successful
     */
    private onCloseResultRequest(user: User): boolean {
        const currentRoom: Room = user.currentRoom

        if (currentRoom == null) {
            console.warn('user "%s" tried to close game result window, although it isn\'t in any', user.userName)
            return false
        }

        currentRoom.sendCloseResultWindow(user)

        console.log('user "%s" closed game result window from room "%s"\'s (room id: %i)',
            user.userName, currentRoom.settings.roomName, currentRoom.id)

        return true
    }

    /**
     * called when the user requests to change team
     * @param setTeamReq the parsed Room packet
     * @param user the user itself
     * @returns true if successful
     */
    private onSetTeamRequest(setTeamReq: InRoomSetUserTeamRequest, user: User): boolean {
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

        currentRoom.setUserToTeam(user, setTeamReq.newTeam)

        // inform every user in the room of the changes
        currentRoom.recurseUsers((u: User): void => {
            currentRoom.sendTeamChangeTo(u, user, setTeamReq.newTeam)
        })

        console.log('user "%s" changed to team %i. room name "%s" room id: %i',
            user.userName, setTeamReq.newTeam, currentRoom.settings.roomName, currentRoom.id)

        return true
    }

    /**
     * called when the user (must be host) requests to start
     * counting down until the game starts
     * @param countdownReq the parsed Room packet
     * @param host the user itself
     * @returns true if successful
     */
    private onGameStartToggleRequest(countdownReq: InRoomCountdown, host: User): boolean {
        const currentRoom: Room = host.currentRoom

        if (currentRoom == null) {
            console.warn('host "%s" tried to toggle a room\'s game start countdown, although it isn\'t in any',
                host.userName)
            return false
        }

        if (host !== currentRoom.host) {
            console.warn('host "%s" tried to toggle a room\'s game start countdown, although it isn\'t the host.'
                + 'room name "%s" room id: %i',
                host.userName, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        const shouldCountdown: boolean = countdownReq.shouldCountdown()
        const count: number = countdownReq.count

        if (currentRoom.canStartGame() === false) {
            console.warn('user "%s" tried to toggle a room\'s game start countdown, although it can\'t start. '
                + 'room name "%s" room id: %i',
                host.userName, currentRoom.settings.roomName, currentRoom.id)
            return false
        }

        if (shouldCountdown) {
            currentRoom.progressCountdown(count)

            console.log('room "%s"\'s (id %i) countdown is at %i (host says it\'s at %i)',
                currentRoom.settings.roomName, currentRoom.id, currentRoom.getCountdown(), count)
        } else {
            currentRoom.stopCountdown()

            console.log('host "%s" canceled room "%s"\'s (id %i) countdown',
                host.userName, currentRoom.settings.roomName, currentRoom.id)
        }

        currentRoom.recurseUsers((u: User): void => {
            currentRoom.sendCountdownTo(u, shouldCountdown)
        })

        return true
    }
}
