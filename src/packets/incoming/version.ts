import { PacketString } from '../packetstring';
import { IncomingPacket } from './packet'

export class IncomingVersionPacket extends IncomingPacket {
    public unk00: any
    public unk01: any
    public clientHash: string

    // returns parsed size of packet
    protected parse(): number {
        let curOffset = super.parse()

        this.unk00 = this.packetData[curOffset++]
        this.unk01 = this.packetData.readUInt16LE(curOffset)
        curOffset += 2

        this.clientHash = PacketString.from(
            this.packetData.slice(curOffset,
                this.packetData.length)).str
        curOffset += 1 + this.packetData[curOffset]

        return curOffset
    }
}
