import Int64 from 'int64-buffer'
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
        const packetLength = this.getSize()

        let curOffset = 0

        const newBuffer = Buffer.alloc(packetLength)

        // packet size excludes packet header
        this.buildHeader(newBuffer, packetLength)
        curOffset += OutgoingPacket.headerLength()

        newBuffer.writeUInt32LE(this.userId, curOffset)
        curOffset += 4

        this.loginName.toBuffer().copy(newBuffer, curOffset)
        curOffset += this.loginName.length()

        this.userName.toBuffer().copy(newBuffer, curOffset)
        curOffset += this.userName.length()

        newBuffer.writeUInt8(this.unk00, curOffset++)

        newBuffer.writeUInt16LE(this.somePort, curOffset)
        curOffset += 2

        return newBuffer
    }

    private getSize(): number {
        let curOffset = 0

        curOffset += OutgoingPacket.headerLength()

        curOffset += 4
        curOffset += this.loginName.length() + 1
        curOffset += this.userName.length() + 1
        curOffset += 1
        curOffset += 2

        return curOffset
    }
}
