import { Uint64LE } from 'int64-buffer';

import { IncomingLoginPacket } from '../packets/incoming/login'
import { OutgoingRoomPacket } from '../packets/outgoing/room'
import { OutgoingUserInfoPacket } from '../packets/outgoing/userinfo'
import { OutgoingUserStartPacket } from '../packets/outgoing/userstart'

export function onLoginPacket(uuid: string, inData: Buffer): Buffer {
    const loginPacket: IncomingLoginPacket = new IncomingLoginPacket(inData)
    console.log('its a login packet! nexonUsername: ' + loginPacket.nexonUsername
        + ' gameUsername: ' + loginPacket.gameUsername
        + ' password: ' + loginPacket.password
        + ' hddHwid: ' + loginPacket.hddHwid
        + ' netCafeId: ' + loginPacket.netCafeId
        + ' userSn: ' + loginPacket.userSn
        + ' isLeague: ' + loginPacket.isLeague)

    const userStartReply: Buffer = new OutgoingUserStartPacket(1,
        loginPacket.gameUsername,
        loginPacket.gameUsername,
        loginPacket.sequence).build()
    const userInfo: OutgoingUserInfoPacket = new OutgoingUserInfoPacket(1,
        loginPacket.gameUsername, 254,
        new Uint64LE(100), new Uint64LE(10000000),
        30, 10, 9, 5,
        loginPacket.sequence + 1)
    const userInfoReply: Buffer = userInfo.build()

    // temporarily host a room
    const roomReply: Buffer = new OutgoingRoomPacket([userInfo], loginPacket.sequence + 2).build()

    return Buffer.concat([userStartReply, userInfoReply, roomReply])
}
