import { TextEncoder } from 'util'

/**
 * Stores an utf8 string used by packets
 * The first 2 bytes (in Little Endian) are the size of the string,
 * followed by the string itself
 * @class PacketLongString
 */
export class PacketLongString {
    public static from(data: Buffer): PacketLongString {
        return new PacketLongString(data.slice(2,
            2 + data.readUInt16LE(0)).toString('utf8'))
    }

    public str: string

    // the actual size of the string in memory
    public actualStrLen: number

    // the length of actualStrLen plus the size byte
    public totalLen: number

    constructor(str: string, rawLength: number = 0) {
        const expectedLen: number = new TextEncoder().encode(str).length

        if (rawLength !== 0) {
            // ensure the received string has a correct length
            if (expectedLen !== rawLength) {
                throw new Error('The string\'s expected length is different from the one in the packet')
            }
        }

        this.str = str
        this.actualStrLen = expectedLen
        this.totalLen = this.actualStrLen + 2
    }

    public toBuffer(): Buffer {
        const newBuffer = Buffer.alloc(this.totalLen)
        newBuffer.writeUInt16LE(this.actualStrLen, 0)
        if (this.str) {
            newBuffer.write(this.str, 2, this.actualStrLen, 'utf8')
        }
        return newBuffer
    }
}
