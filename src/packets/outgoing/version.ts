import { PacketId } from '../definitions'
import { PacketString } from '../packetstring'
import { OutgoingPacket } from './packet'

export class OutgoingVersionPacket extends OutgoingPacket {
    private badHash: boolean
    private hash: PacketString

    constructor(badHash: boolean, hash: string, seq: number) {
        super()
        this.sequence = seq
        this.id = PacketId.Version

        this.badHash = badHash
        this.hash = new PacketString(hash)
    }

    public build(): Buffer {
        const packetLength = OutgoingPacket.headerLength() + // base packet
            1 + // is bad hash
            this.hash.length() // hash's length including size byte

        const newBuffer = Buffer.alloc(packetLength)

        // packet size excludes packet header
        this.buildHeader(newBuffer, packetLength)

        // is bad hash?
        newBuffer[5] = this.badHash as any as number // this is ugly

        // some hash
        this.hash.toBuffer().copy(newBuffer, 6)

        return newBuffer
    }
}
