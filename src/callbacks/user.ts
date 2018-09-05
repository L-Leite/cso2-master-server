import * as fs from 'fs'
import * as net from 'net'

import { IncomingLoginPacket } from '../packets/incoming/login'
import { OutgoingRoomPacket } from '../packets/outgoing/room'
import { OutgoingUserInfoPacket } from '../packets/outgoing/userinfo'
import { OutgoingUserStartPacket } from '../packets/outgoing/userstart'

import { ExtendedSocket } from '../extendedsocket';
import { OutgoingUdpPacket } from '../packets/outgoing/udp';
import { RoomData } from '../roomdata';
import { RoomStorage } from '../roomstorage';
import { ServerManager } from '../servermanager';
import { UserData } from '../userdata';
import { UserStorage } from '../userstorage';
import { BasePacketCallback } from './base';

let curUserId = 1
const curRoomId = 1

let curRoom: RoomData = null

/**
 * handles the version packet
 * @class UserCallback
 */
export class UserPacketCallback extends BasePacketCallback {
    private newUserData: UserData

    /**
     * parses incoming packet's data
     * @returns true if successful, false otherwise
     */
    protected parseInPacket(): boolean {
        const loginPacket: IncomingLoginPacket = new IncomingLoginPacket(this.inData)
        console.log('its a login packet! nexonUsername: ' + loginPacket.nexonUsername
            + ' gameUsername: ' + loginPacket.gameUsername
            + ' password: ' + loginPacket.password
            + ' hddHwid: ' + loginPacket.hddHwid
            + ' netCafeId: ' + loginPacket.netCafeId
            + ' userSn: ' + loginPacket.userSn
            + ' isLeague: ' + loginPacket.isLeague)

        this.newUserData = UserStorage.addUser(
            this.socket.uuid, curUserId++, loginPacket.gameUsername)
        return true
    }

    /**
     * builds the reply to be sent to the socket
     * @returns the data to be sent to the socket
     */
    protected buildOutPacket(): Buffer {
        const userStartReply: Buffer = new OutgoingUserStartPacket(
            this.newUserData.userId,
            this.newUserData.userName,
            this.newUserData.userName,
            this.socket.getSeq()).build()

        const userInfo: OutgoingUserInfoPacket = new OutgoingUserInfoPacket(
            this.newUserData.userId,
            this.newUserData.userName, this.newUserData.level,
            this.newUserData.curExp, this.newUserData.maxExp,
            this.newUserData.wins, this.newUserData.kills,
            this.newUserData.deaths, this.newUserData.assists,
            this.socket.getSeq())
        const userInfoReply: Buffer = userInfo.build()

        // temporarily host a room
        if (curRoom == null) {
            curRoom = RoomStorage.addRoom(curRoomId, 'test room', this.newUserData.userId)

            curRoom.addPlayer(this.newUserData)

            const roomReply: Buffer = new OutgoingRoomPacket(this.socket.getSeq())
                .createAndJoinRoom(curRoom.roomId, curRoom.roomName, curRoom.hostId,
                    curRoom.gameModeId, curRoom.mapId, curRoom.winLimit, curRoom.killLimit,
                    curRoom.players)

            const buf: Buffer = Buffer.from([0x55, 0x00, 0x0B, 0x00, 0x42, 0x00, 0x01, 0xBA,
                0x53, 0xF8, 0x5A, 0x00, 0x00, 0x00, 0x00])

            buf.writeUInt8(this.socket.getSeq(), 1)

            const buf2: Buffer = Buffer.from([0x55, 0x00, 0x0B, 0x00, 0x42, 0x00, 0x00, 0xBA,
                0x53, 0xF8, 0x5A, 0x00, 0x00, 0x00, 0x00])

            buf2.writeUInt8(this.socket.getSeq(), 1)

            return Buffer.concat([userStartReply, userInfoReply, roomReply, buf, buf2])
        } else {
            curRoom.addPlayer(this.newUserData)

            const roomReply: Buffer = new OutgoingRoomPacket(this.socket.getSeq())
                .createAndJoinRoom(curRoom.roomId, curRoom.roomName, curRoom.hostId,
                    curRoom.gameModeId, curRoom.mapId, curRoom.winLimit, curRoom.killLimit,
                    curRoom.players)

            const hostUser: UserData = UserStorage.getUser(curRoom.hostId)
            const hostSocket: ExtendedSocket =
                ServerManager.getSocketByUuid(hostUser.uuid)

            // const udpReply: Buffer =
            //    new OutgoingUdpPacket(0, this.newUserData.userId, this.newUserData.ip,
            //        this.newUserData.port, this.socket.getSeq()).build()

            const roomReply2: Buffer = new OutgoingRoomPacket(hostSocket.getSeq())
                .newPlayerJoinRoom(this.newUserData)
            hostSocket.write(Buffer.concat([roomReply2]))

            // const udpReply2: Buffer =
            //    new OutgoingUdpPacket(1, hostUser.userId, hostUser.ip, hostUser.port, hostSocket.getSeq()).build()

            return Buffer.concat([userStartReply, userInfoReply, roomReply])
        }
    }
}
