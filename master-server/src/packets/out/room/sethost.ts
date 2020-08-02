import { OutPacketBase } from 'packets/out/packet'

/**
 * sends out who's the new host of a room
 * @class OutRoomSetHost
 */
export class OutRoomSetHost {
    public static build(userId: number, outPacket: OutPacketBase): void {
        outPacket.writeUInt32(userId)
        outPacket.writeUInt8(0) // unused
    }
}
