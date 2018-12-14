import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'
import { PacketString } from 'packets/packetstring'

/**
 * outgoing version packet
 * Structure:
 * [base packet]
 * [isBadHash - 1 byte]
 * [hash - the length of the str + 1 byte]
 * @class OutVersionPacket
 */
export class OutVersionPacket extends OutPacketBase {
    private isBadHash: number
    private hash: PacketString

    constructor(badHash: boolean, hash: string, seq: number) {
        super()
        this.sequence = seq
        this.id = PacketId.Version

        this.isBadHash = badHash as any as number // is there a better way to do this?
        this.hash = new PacketString(hash)
    }

    /**
     * builds the packet with data provided by us
     */
    public build(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 16, incrementAmount: 4 })

        this.buildHeader()
        this.writeUInt8(this.isBadHash)
        this.writeString(this.hash)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }
}
