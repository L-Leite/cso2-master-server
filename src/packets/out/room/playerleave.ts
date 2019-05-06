import { OutPacketBase } from 'packets/out/packet'

/**
 * tells a room's users that someone left the room
 * @class OutRoomPlayerLeave
 */
export class OutRoomPlayerLeave {
    public static build(userId: number, outPacket: OutPacketBase): void {
        outPacket.writeUInt32(userId)
    }
}
