import { OutPacketBase } from 'packets/out/packet'

/**
 * sends out who's the new host of a room
 * @class OutRoomSetHost
 */
export class OutRoomSetHost {
    private hostUserId: number
    private unused: number

    constructor(hostUserId: number) {
        this.hostUserId = hostUserId
        this.unused = 0
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt32(this.hostUserId)
        outPacket.writeUInt8(this.unused)
    }
}
