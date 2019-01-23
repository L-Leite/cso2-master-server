import { OutPacketBase } from 'packets/out/packet'

/**
 * tells a host to start a match
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
