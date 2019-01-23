import { WritableStreamBuffer } from 'stream-buffers'

import { OutPacketBase } from 'packets/out/packet'

import { PacketId } from 'packets/definitions'
import { PacketString } from 'packets/packetstring'

import { ExtendedSocket } from 'extendedsocket'

/**
 * sends out the result of a client integrity validation
 * Structure:
 * [base packet]
 * [isBadHash - 1 byte]
 * [hash - the length of the str + 1 byte]
 * @class OutVersionPacket
 */
export class OutVersionPacket extends OutPacketBase {
    private isBadHash: number
    private hash: PacketString

    constructor(badHash: boolean, hash: string, socket: ExtendedSocket) {
        super(socket, PacketId.Version)

        this.isBadHash = badHash as any as number // is there a better way to do this?
        this.hash = new PacketString(hash)
    }

    /**
     * builds the packet with data provided by us
     */
    public build(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 40, incrementAmount: 12 })

        this.buildHeader()
        this.writeUInt8(this.isBadHash)
        this.writeString(this.hash)

        return this.getData()
    }
}
