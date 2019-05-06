import { OutPacketBase } from 'packets/out/packet'

/**
 * something needed to go with the joinroom info
 * @class LobbyJoinRoom
 */
export class LobbyJoinRoom {
    public static build(unk00: number, unk01: number, unk02: number, outPacket: OutPacketBase): void {
        outPacket.writeUInt8(unk00) // unk00
        outPacket.writeUInt8(unk01) // unk01
        outPacket.writeUInt8(unk02) // unk02
    }
}
