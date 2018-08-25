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

    protected buildHeader(newBuffer: Buffer, packetLength: number): void {
        newBuffer[0] = PacketSignature // signature
        newBuffer[1] = this.sequence
        // 4 is the real header size, id doesnt count
        newBuffer.writeUInt16LE(packetLength - 4, 2)
        newBuffer[4] = this.id // packet id
    }
}
