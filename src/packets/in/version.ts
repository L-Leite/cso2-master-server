import { InPacketBase } from 'packets/in/packet'

/**
 * incoming version packet
 * Structure:
 * [base packet]
 * [unk00 - 1 byte]
 * [unk01 - 2 byte]
 * [clientHash - the length of the str + 1 byte]
 * @class InVersionPacket
 */
export class InVersionPacket extends InPacketBase {
    public unk00: any
    public unk01: any
    public clientHash: string

    /**
     * parses the packet's data
     */
    protected parse(): void {
        super.parse()

        this.unk00 = this.readUInt8()
        this.unk01 = this.readUInt16()
        this.clientHash = this.readString()
    }
}
