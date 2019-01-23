import { OutPacketBase } from 'packets/out/packet'

/**
 * tells a room's users that someone left the room
 * @class OutRoomPlayerLeave
 */
export class OutRoomPlayerLeave {
    private userId: number

    constructor(userId: number) {
        this.userId = userId
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt32(this.userId)
    }
}
