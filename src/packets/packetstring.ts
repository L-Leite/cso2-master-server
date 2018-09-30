/**
 * Stores an utf8 string used by packets
 * The first byte is the size of the string,
 * followed by the string itself
 * @class PacketString
 */
export class PacketString {
    public static from(data: Buffer): PacketString {
        return new PacketString(data.slice(1,
            1 + data[0]).toString('utf8'))
    }

    public str: string

    constructor(str: string) {
        this.str = str
    }

    public length(): number {
        if (this.str == null) {
            return 0
        }
        return this.str.length
    }

    public rawLength(): number {
        if (this.str == null) {
            return 1
        }
        return this.str.length + 1
    }

    public toBuffer(): Buffer {
        const newBuffer = Buffer.alloc(this.rawLength())
        newBuffer[0] = this.length()
        if (this.str) {
            newBuffer.write(this.str, 1, this.length(), 'utf8')
        }
        return newBuffer
    }
}
