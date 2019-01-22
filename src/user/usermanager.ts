import { ExtendedSocket } from 'extendedsocket'

import { Room } from 'room/room'
import { User } from 'user/user'

import { ChannelManager } from 'channel/channelmanager'

import { InLoginPacket } from 'packets/in/login'
import { InVersionPacket } from 'packets/in/version'

import { HostPacketType, InHostPacket } from 'packets/in/host'
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
                         channels: ChannelManager): boolean {
        const loginPacket: InLoginPacket = new InLoginPacket(loginData)

        const newUser: User = this.loginUser(loginPacket.gameUsername,
            loginPacket.password, sourceSocket)

        if (newUser == null) {
            console.warn('login failed for user ' + loginPacket.gameUsername
                + ' uuid: ' + sourceSocket.uuid)
            return false
        }

        console.log('user ' + loginPacket.gameUsername
            + ' logged in, uuid: ' + sourceSocket.uuid)

        const userStartReply: Buffer = new OutUserStartPacket(
            newUser.userId,
            loginPacket.gameUsername,
            loginPacket.gameUsername,
            sourceSocket.getSeq()).build()

        const userInfoReply: Buffer =
            new OutUserInfoPacket(sourceSocket.getSeq()).fullUserUpdate(newUser)

        const serverListReply: Buffer =
            channels.buildServerListPacket(sourceSocket.getSeq())

        sourceSocket.send(userStartReply)
        sourceSocket.send(userInfoReply)
        sourceSocket.send(serverListReply)

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
            console.warn('Socket %s sent a host packet, but isn\'t logged in',
                sourceSocket.uuid)
        }

        switch (hostPacket.packetType) {
            case HostPacketType.OnGameEnd:
                return this.onHostGameEnd(user)
            case HostPacketType.PreloadInventory:
                return this.onHostPreloadInventory(hostPacket, user)
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

        currentRoom.setGameEnd()

        return true
    }

    public onHostPreloadInventory(hostPacket: InHostPacket, user: User): boolean {
        const currentRoom: Room = user.currentRoom

        if (currentRoom == null) {
            console.warn('User %s sent an host entity num packet without being in a room',
                user.userName)
            return false
        }

        const newEntityNum: number = hostPacket.preloadInventory.entityNum
        const hostSocket: ExtendedSocket = currentRoom.host.socket

        console.log('Setting user "%s"\'s entity num as %i in room %s',
            user.userName, newEntityNum, currentRoom.settings.roomName)

        currentRoom.setUserEntityNum(user, newEntityNum)

        const reply: Buffer =
            new OutHostPacket(hostSocket.getSeq()).preloadInventory(newEntityNum)

        hostSocket.send(reply)

        return true
    }

    public onVersionPacket(versionData: Buffer, sourceSocket: ExtendedSocket): boolean {
        const versionPacket: InVersionPacket = new InVersionPacket(versionData)
        console.log(sourceSocket.uuid + ' sent a version packet. clientHash: '
            + versionPacket.clientHash)

        // i think the client ignores the hash string
        const versionReply: Buffer = new OutVersionPacket(
            false, '6246015df9a7d1f7311f888e7e861f18', sourceSocket.getSeq()).build()

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

    private cleanUpUser(user: User) {
        if (user.currentRoom) {
            user.currentRoom.removeUser(user)
        }
    }
}
