import { PacketSignature } from '../definitions'

export class IncomingPacket {
    public sequence: number
    public length: number
    public id: number
    protected packetData: Buffer
    private signature: number

    constructor(data: Buffer) {
        this.packetData = data
        this.parse()
    }

    public isValid(): boolean {
        return this.signature === PacketSignature
    }

    public data(): Buffer {
        return this.packetData
    }

    // returns parsed size of packet
    protected parse(): number {
        let curOffset = 0
        this.signature = this.packetData[curOffset++]

        if (typeof this.signature === 'string') {
            this.signature = (this.signature as string).charCodeAt(0)
        }

        if (this.signature !== PacketSignature) {
            throw new Error('this is not a packet! signature: ' +
                this.signature)
        }

        this.sequence = this.packetData[curOffset++]
        this.length = this.packetData.readUInt16LE(curOffset)
        curOffset += 2
        this.id = this.packetData[curOffset++]

        return curOffset
    }
}
