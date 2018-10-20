import * as ip from 'ip'

import { ExtendedSocket } from 'extendedsocket'

import { User } from 'user/user'

import { ChannelManager } from 'channel/channelmanager'

import { InLoginPacket } from 'packets/in/login'
import { InUdpPacket } from 'packets/in/udp'
import { InVersionPacket } from 'packets/in/version'

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
        console.log('trying to login as ' + loginPacket.gameUsername)

        const newUser: User = this.loginUser(loginPacket.gameUsername,
            loginPacket.password, sourceSocket)

        if (newUser == null) {
            console.warn('login failed for user ' + loginPacket.gameUsername
                + ' uuid: ' + sourceSocket.uuid)
            return false
        }

        const userStartReply: Buffer = new OutUserStartPacket(
            newUser.userId,
            loginPacket.gameUsername,
            loginPacket.gameUsername,
            sourceSocket.getSeq()).build()

        const userInfoReply: Buffer =
            new OutUserInfoPacket(sourceSocket.getSeq()).fullUserUpdate(newUser)

        const serverListReply: Buffer =
            channels.buildServerListPacket(sourceSocket.getSeq())

        sourceSocket.write(userStartReply)
        sourceSocket.write(userInfoReply)
        sourceSocket.write(serverListReply)

        return true
    }

    /**
     * receives the client's udp holepunch information
     * @param udpData the udp's packet data
     * @param sourceSocket the client's socket
     */
    public onUdpPacket(udpData: Buffer, sourceSocket: ExtendedSocket): boolean {
        const udpPacket: InUdpPacket = new InUdpPacket(udpData)
        console.log('udp data from ' + sourceSocket.uuid +
            ': ip: ' + udpPacket.ip + 'port:' + udpPacket.port)

        const user: User = this.getUserByUuid(sourceSocket.uuid)

        if (user == null) {
            console.warn('bad holepunch user, uuid: ' + sourceSocket.uuid)
            return false
        }

        // cso2's client subtracts 0x8080000 from the ip (128 from the first two bytes)
        // this might bug out if one of the two bytes of the ip are less than 128
        // requires testing
        let convertedIp = ip.toLong(udpPacket.ip)
        convertedIp += 0x80800000

        user.externalIpAddress = ip.fromLong(convertedIp)
        user.port = udpPacket.port

        return true
    }

    public onVersionPacket(versionData: Buffer, sourceSocket: ExtendedSocket): boolean {
        const versionPacket: InVersionPacket = new InVersionPacket(versionData)
        console.log(sourceSocket.uuid + ' sent a version packet. clientHash: '
            + versionPacket.clientHash)

        // i think the client ignores the hash string
        const versionReply: Buffer = new OutVersionPacket(
            false, '6246015df9a7d1f7311f888e7e861f18', sourceSocket.getSeq()).build()

        sourceSocket.write(versionReply)

        return true
    }

    public loginUser(userName: string, password: string, sourceSocket: ExtendedSocket): User {
        return this.addUser(userName, sourceSocket)
    }

    public addUser(userName: string, socket: ExtendedSocket): User {
        const newUser: User = new User(socket.uuid,
            socket.remoteAddress, this.nextUserId++, userName)
        this.users.push(newUser)
        return newUser
    }

    public getUser(userId: number): User {
        for (const user of this.users) {
            if (user.userId === userId) {
                return user
            }
        }
        return null
    }

    public getUserByUuid(uuid: string): User {
        for (const user of this.users) {
            if (user.uuid === uuid) {
                return user
            }
        }
        return null
    }

    public removeUser(userId: number): void {
        for (const key in this.users) {
            if (this.users.hasOwnProperty(key)) {
                const user = this.users[key]

                if (user.userId === userId) {
                    delete this.users[key]
                    return
                }
            }
        }
    }

    public removeUserByUuid(uuid: string): void {
        for (const key in this.users) {
            if (this.users.hasOwnProperty(key)) {
                const user = this.users[key]

                if (user.uuid === uuid) {
                    delete this.users[key]
                    return
                }
            }
        }
    }
}
