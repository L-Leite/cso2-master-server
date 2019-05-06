import { OutPacketBase } from 'packets/out/packet'

import { Uint64LE } from 'int64-buffer'
import { PacketString } from 'packets/packetstring'

/**
 * sends an user the match's end result
 * @class OutRoomGameResult
 */
export class OutRoomGameResult {
    public static build(outPacket: OutPacketBase): void {
        outPacket.writeUInt8(0) // unk00
        outPacket.writeUInt8(0) // unk01
        outPacket.writeUInt8(0) // unk02
        outPacket.writeUInt64(new Uint64LE(0)) // unk03
        outPacket.writeUInt64(new Uint64LE(0)) // unk04
        outPacket.writeUInt8(0) // unk05
        outPacket.writeString(new PacketString(null)) // unk06
        outPacket.writeString(new PacketString(null)) // unk07
        outPacket.writeUInt8(0) // unk08
        outPacket.writeUInt8(0) // unk09
    }
}
