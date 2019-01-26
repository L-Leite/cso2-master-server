import { ExtendedSocket } from 'extendedsocket'

import { Room, RoomStatus } from 'room/room'
import { User } from 'user/user'

import { ChannelManager } from 'channel/channelmanager'

import { HostPacketType } from 'packets/hostshared'

import { InHostPacket } from 'packets/in/host'
import { InHostPreloadInventory } from 'packets/in/host/preloadinventory'
import { InLoginPacket } from 'packets/in/login'
import { InVersionPacket } from 'packets/in/version'

import { OutHostPacket } from 'packets/out/host'
import { OutUserInfoPacket } from 'packets/out/userinfo'
import { OutUserStartPacket } from 'packets/out/userstart'
import { OutVersionPacket } from 'packets/out/version'

/**
 * handles the user logic
 */
export class UserManager {
    private users: User[]
    private nextUserId: number

    constructor() {
        this.users = []
        this.nextUserId = 1
    }

    /**
     * called when we receive a login request packet
     * @param loginData the login packet's data
     * @param sourceSocket the client's socket
     * @param server the instance to the server
     */
    public onLoginPacket(loginData: Buffer, sourceSocket: ExtendedSocket,
                         channels: ChannelManager, holepunchPort: number): boolean {
        const loginPacket: InLoginPacket = new InLoginPacket(loginData)

        const newUser: User = this.loginUser(loginPacket.gameUsername,
            loginPacket.password, sourceSocket)

        if (newUser == null) {
            console.warn('login failed for user %s (uuid: %s)',
                loginPacket.gameUsername, sourceSocket.uuid)
            return false
        }

        console.log('user %s logged in (uuid: %s)',
            loginPacket.gameUsername, sourceSocket.uuid)

        this.sendUserInfoTo(newUser, holepunchPort)
        channels.sendChannelListTo(newUser)

        return true
    }

    /**
     * handles the incoming host packets
     * @param packetData the host's packet data
     * @param sourceSocket the client's socket
     */
    public onHostPacket(packetData: Buffer, sourceSocket: ExtendedSocket): boolean {
        const hostPacket: InHostPacket = new InHostPacket(packetData)

        const user: User = this.getUserByUuid(sourceSocket.uuid)

        if (user == null) {
            console.warn('Socket %s sent a host packet, but isn\'t logged in', sourceSocket.uuid)
        }

        switch (hostPacket.packetType) {
            case HostPacketType.OnGameEnd:
                return this.onHostGameEnd(user)
            case HostPacketType.PreloadInventory:
                const preloadData: InHostPreloadInventory = new InHostPreloadInventory(hostPacket)
                return this.onHostPreloadInventory(preloadData, user)
        }

        console.warn('UserManager::onHostPacket: unknown host packet type %i',
            hostPacket.packetType)

        return false
    }

    public onHostGameEnd(user: User): boolean {
        const currentRoom: Room = user.currentRoom

        if (currentRoom == null) {
            console.warn('User %s sent an host entity num packet without being in a room',
                user.userName)
            return false
        }

        console.log('Ending game for room "%s" (room id %i)',
            currentRoom.settings.roomName, currentRoom.id)

        currentRoom.setStatus(RoomStatus.Waiting)

        currentRoom.recurseUsers((u: User): void => {
            currentRoom.sendGameEnd(u)
        })

        return true
    }

    public onHostPreloadInventory(preloadData: InHostPreloadInventory, user: User): boolean {
        const currentRoom: Room = user.currentRoom

        if (currentRoom == null) {
            console.warn('User %s sent an host entity num packet without being in a room',
                user.userName)
            return false
        }

        const newEntityNum: number = preloadData.entityNum

        currentRoom.setUserEntityNum(user, newEntityNum)
        this.sendPreloadInventoryTo(user, newEntityNum)

        console.log('Setting user "%s"\'s entity num as %i in room %s',
            user.userName, newEntityNum, currentRoom.settings.roomName)

        return true
    }

    public onVersionPacket(versionData: Buffer, sourceSocket: ExtendedSocket): boolean {
        const versionPacket: InVersionPacket = new InVersionPacket(versionData)
        console.log(sourceSocket.uuid + ' sent a version packet. clientHash: '
            + versionPacket.clientHash)

        // i think the client ignores the hash string
        const versionReply: Buffer = new OutVersionPacket(
            false, '6246015df9a7d1f7311f888e7e861f18', sourceSocket).build()

        sourceSocket.send(versionReply)

        return true
    }

    public loginUser(userName: string, password: string, sourceSocket: ExtendedSocket): User {
        return this.addUser(userName, sourceSocket)
    }

    public isUuidLoggedIn(uuid: string): boolean {
        return this.getUserByUuid(uuid) != null
    }

    public addUser(userName: string, socket: ExtendedSocket): User {
        const newUser: User = new User(socket, this.nextUserId++, userName)
        this.users.push(newUser)
        return newUser
    }

    public getUserById(userId: number): User {
        for (const user of this.users) {
            if (user.userId === userId) {
                return user
            }
        }
        return null
    }

    public getUserByUuid(uuid: string): User {
        for (const user of this.users) {
            if (user.socket.uuid === uuid) {
                return user
            }
        }
        return null
    }

    public removeUser(targetUser: User): void {
        this.cleanUpUser(targetUser)
        this.users.splice(this.users.indexOf(targetUser), 1)
    }

    public removeUserById(userId: number): void {
        for (const user of this.users) {
            if (user.userId === userId) {
                this.cleanUpUser(user)
                this.users.splice(this.users.indexOf(user), 1)
                return
            }
        }
    }

    public removeUserByUuid(uuid: string): void {
        for (const user of this.users) {
            if (user.socket.uuid === uuid) {
                this.cleanUpUser(user)
                this.users.splice(this.users.indexOf(user), 1)
                return
            }
        }
    }

    /**
     * send an user's info to itself
     * @param user the target user
     */
    private sendUserInfoTo(user: User, holepunchPort: number): void {
        const userStartReply: Buffer = new OutUserStartPacket(
            user.userId, user.userName, user.userName, holepunchPort, user.socket).build()

        const userInfoReply: Buffer =
            new OutUserInfoPacket(user.socket).fullUserUpdate(user)

        user.socket.send(userStartReply)
        user.socket.send(userInfoReply)
    }

    /**
     * send the user an entity's info
     * @param user the target user
     */
    private sendPreloadInventoryTo(user: User, entityNum: number): void {
        const reply: Buffer =
            new OutHostPacket(user.socket).preloadInventory(entityNum)

        user.socket.send(reply)
    }

    /**
     * if the user was in a room, tell it that the user has logged disconnected
     * @param user the target user
     */
    private cleanUpUser(user: User): void {
        if (user.currentRoom) {
            user.currentRoom.removeUser(user)
        }
    }
}
