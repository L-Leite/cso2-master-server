import { WritableStreamBuffer } from 'stream-buffers';

import { ValToBuffer } from '../../util';

import { PacketId } from '../definitions'
import { PacketString } from '../packetstring'
import { OutgoingPacket } from './packet'

export class OutgoingVersionPacket extends OutgoingPacket {
    private badHash: number
    private hash: PacketString

    constructor(badHash: boolean, hash: string, seq: number) {
        super()
        this.sequence = seq
        this.id = PacketId.Version

        this.badHash = badHash as any as number
        this.hash = new PacketString(hash)
    }

    public build(): Buffer {
        const outStream: WritableStreamBuffer = new WritableStreamBuffer(
            { initialSize: 16, incrementAmount: 4 })

        // packet size excludes packet header
        this.buildHeader(outStream)

        // packet id
        outStream.write(ValToBuffer(this.id, 1))

        // is bad hash?
        outStream.write(ValToBuffer(this.badHash, 1))

        // some hash
        outStream.write(this.hash.toBuffer())

        const resBuffer: Buffer = outStream.getContents()
        this.setPacketLength(resBuffer)

        return resBuffer
    }
}
