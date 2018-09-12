import { OutPacketBase } from '../packet'

/**
 * Sub structure of Host packet
 * Stores information to start a room's match
 * @class HostGameStart
 */
export class HostGameStart {
    private hostUserId: number

    constructor(hostUserId: number) {
        this.hostUserId = hostUserId
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt32(this.hostUserId)
    }
}
