import { OutPacketBase } from 'packets/out/packet'

import { Uint64LE } from 'int64-buffer'
import { PacketString } from 'packets/packetstring'

/**
 * sends an user the match's end result
 * @class OutRoomGameResult
 */
export class OutRoomGameResult {
    private unk00: number
    private unk01: number
    private unk02: number
    private unk03: Uint64LE
    private unk04: Uint64LE
    private unk05: number
    private unk06: PacketString
    private unk07: PacketString
    private unk08: number
    private unk09: number

    constructor() {
        this.unk00 = 0
        this.unk01 = 0
        this.unk02 = 0
        this.unk03 = new Uint64LE(0)
        this.unk04 = new Uint64LE(0)
        this.unk05 = 0
        this.unk06 = new PacketString('unk06')
        this.unk07 = new PacketString('unk07')
        this.unk08 = 0
        this.unk09 = 0
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt8(this.unk00)
        outPacket.writeUInt8(this.unk01)
        outPacket.writeUInt8(this.unk02)
        outPacket.writeUInt64(this.unk03)
        outPacket.writeUInt64(this.unk04)
        outPacket.writeUInt8(this.unk05)
        outPacket.writeString(this.unk06)
        outPacket.writeString(this.unk07)
        outPacket.writeUInt8(this.unk08)
        outPacket.writeUInt8(this.unk09)
    }
}
