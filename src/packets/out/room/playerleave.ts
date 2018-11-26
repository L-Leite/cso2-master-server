import { OutPacketBase } from 'packets/out/packet'

/**
 * Sub structure of Room packet
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
