import { OutPacketBase } from 'packets/out/packet'

/**
 * Sub structure of Lobby packet
 * @class ConfigListSomeInfo
 */
export class LobbySomeInfo {
    private unk00: number
    private unk01: number
    private unk02: number

    constructor(unk00: number, unk01: number,
                unk02: number) {
        this.unk00 = unk00
        this.unk01 = unk01
        this.unk02 = unk02
    }
    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt8(this.unk00)
        outPacket.writeUInt8(this.unk01)
        outPacket.writeUInt8(this.unk02)
    }
}
