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
        return this.str.length
    }

    public toBuffer(): Buffer {
        const newBuffer = Buffer.alloc(2 + this.str.length)
        newBuffer.writeUInt16LE(this.str.length, 0)
        newBuffer.write(this.str, 2, this.str.length, 'utf8')
        return newBuffer
    }
}
