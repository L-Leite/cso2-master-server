import { TextEncoder } from 'util'

/**
 * Stores an utf8 string used by packets
 * The first byte is the size of the string,
 * followed by the string itself
 * @class PacketString
 */
export class PacketString {
    public static from(data: Buffer): PacketString {
        return new PacketString(data.slice(1,
            1 + data[0]).toString('utf8'), data[0])
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
        this.totalLen = this.actualStrLen + 1
    }

    public toBuffer(): Buffer {
        const newBuffer = Buffer.alloc(this.totalLen)
        newBuffer[0] = this.actualStrLen
        if (this.str) {
            newBuffer.write(this.str, 1, this.actualStrLen, 'utf8')
        }
        return newBuffer
    }
}
