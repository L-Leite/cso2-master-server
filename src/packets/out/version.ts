import { WritableStreamBuffer } from 'stream-buffers'

import { OutPacketBase } from 'packets/out/packet'

import { PacketId } from 'packets/definitions'

/**
 * sends out the result of a client integrity validation
 * Structure:
 * [base packet]
 * [isBadHash - 1 byte]
 * [hash - the length of the str + 1 byte]
 * @class OutVersionPacket
 */
export class OutVersionPacket extends OutPacketBase {

    constructor(isBadHash: boolean, hash: string) {
        super(PacketId.Version)

        this.outStream = new WritableStreamBuffer(
            { initialSize: 40, incrementAmount: 12 })

        this.buildHeader()
        this.writeUInt8(isBadHash ? 1 : 0)
        this.writeString(hash)
    }
}
