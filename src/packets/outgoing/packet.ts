import { WritableStreamBuffer } from 'stream-buffers'
import { ValToBuffer } from '../../util';

import { PacketSignature } from '../definitions'

export class OutgoingPacket {
    public static headerLength(): number {
        return 5
    }

    protected sequence: number
    protected id: number

    public build(): Buffer {
        throw new Error('You must use a packet class!')
    }

    protected buildHeader(bufStream: WritableStreamBuffer): void {
        bufStream.write(ValToBuffer(PacketSignature, 1))
        bufStream.write(ValToBuffer(this.sequence, 1))
        bufStream.write(ValToBuffer(0, 2))
    }

    protected setPacketLength(packet: Buffer) {
        packet.writeUInt16LE(packet.byteLength - 4, 2)
    }
}
