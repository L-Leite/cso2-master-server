import { OutPacketBase } from 'packets/out/packet'

/**
 * Sub structure of Host packet
 * Stores information to start a room's match
 * @class OutHostGameStart
 */
export class OutHostGameStart {
    private hostUserId: number

    constructor(hostUserId: number) {
        this.hostUserId = hostUserId
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt32(this.hostUserId)
    }
}
