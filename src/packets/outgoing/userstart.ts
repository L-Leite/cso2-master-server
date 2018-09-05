import { WritableStreamBuffer } from 'stream-buffers';

import { ValToBuffer } from '../../util';

import { PacketId } from '../definitions'
import { PacketString } from '../packetstring'
import { OutgoingPacket } from './packet'

export class OutgoingUserStartPacket extends OutgoingPacket {
    private userId: number
    private loginName: PacketString
    private userName: PacketString
    private unk00: number
    private somePort: number
    constructor(userId: number, loginName: string, userName: string, seq: number) {
        super()
        this.sequence = seq
        this.id = PacketId.UserStart

        this.userId = userId
        this.loginName = new PacketString(loginName)
        this.userName = new PacketString(userName)
        this.unk00 = 1
        this.somePort = 21506
    }

    public build(): Buffer {
        const outStream: WritableStreamBuffer = new WritableStreamBuffer(
            { initialSize: 16, incrementAmount: 4 })

        // packet size excludes packet header
        this.buildHeader(outStream)

        // packet id
        outStream.write(ValToBuffer(this.id, 1))

        outStream.write(ValToBuffer(this.userId, 4))

        outStream.write(this.loginName.toBuffer())

        outStream.write(this.userName.toBuffer())

        outStream.write(ValToBuffer(this.unk00, 1))

        outStream.write(ValToBuffer(this.somePort, 2))

        const resBuffer: Buffer = outStream.getContents()
        this.setPacketLength(resBuffer)

        return resBuffer
    }
}
