import { OutPacketBase } from 'packets/out/packet'

/**
 * Sub structure of ConfigList packet
 * @class ConfigListSomeInfo
 */
export class ConfigListSomeInfo {
    private unk00: number
    private unk01: number
    private unk02: number
    private unk03: number

    constructor(unk00: number, unk01: number,
                unk02: number, unk03: number) {
        this.unk00 = unk00
        this.unk01 = unk01
        this.unk02 = unk02
        this.unk03 = unk03
    }
    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt8(this.unk00)
        outPacket.writeUInt32(this.unk01)
        outPacket.writeUInt32(this.unk02)
        outPacket.writeUInt8(this.unk03)
    }
}
