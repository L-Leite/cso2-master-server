export class PacketString {
    public static from(data: Buffer): PacketString {
        return new PacketString(data.slice(1,
            1 + data[0]).toString('ascii'))
    }

    public str: string

    constructor(str: string) {
        this.str = str
    }

    public length(): number {
        if (this.str == null) {
            return null
        }
        return this.str.length
    }

    public toBuffer(): Buffer {
        const newBuffer = Buffer.alloc(1 + this.length())
        newBuffer[0] = this.length()
        if (this.str) {
            newBuffer.write(this.str, 1, this.length(), 'ascii')
        }
        return newBuffer
    }
}
