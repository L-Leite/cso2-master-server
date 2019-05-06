import { OutPacketBase } from 'packets/out/packet'
import { RoomReadyStatus } from 'room/room'

/**
 * sends the ready status of an user
 * @class OutRoomPlayerReady
 */
export class OutRoomPlayerReady {
    public static build(userId: number, readyStatus: RoomReadyStatus, outPacket: OutPacketBase): void {
        outPacket.writeUInt32(userId)
        outPacket.writeUInt8(readyStatus)
    }
}
