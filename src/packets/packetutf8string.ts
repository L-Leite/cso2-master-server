/**
 * Stores an utf8 string used by packets
 * The first 2 bytes (in Little Endian) are the size of the string,
 * followed by the string itself
 * @class PacketUtf8String
 */
export class PacketUtf8String {
    public static from(data: Buffer): PacketUtf8String {
        return new PacketUtf8String(data.slice(2,
            2 + data.readUInt16LE(0)).toString('utf8'))
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
            return 2
        }
        return this.str.length + 2
    }

    public toBuffer(): Buffer {
        const newBuffer = Buffer.alloc(this.rawLength())
        newBuffer.writeUInt16LE(this.length(), 0)
        if (this.str) {
            newBuffer.write(this.str, 2, this.length(), 'utf8')
        }
        return newBuffer
    }
}
