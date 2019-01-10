import { Uint64LE } from 'int64-buffer'

import { OutPacketBase } from 'packets/out/packet'

/**
 * Sub structure of Host packet
 * joins a host's match
 * @class OutHostJoinHost
 */
export class OutHostJoinHost {
    private hostUserId: number
    private unk00: Uint64LE

    constructor(hostUserId: number) {
        this.hostUserId = hostUserId
        this.unk00 = new Uint64LE(0)
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt32(this.hostUserId)
        outPacket.writeUInt64(this.unk00)
    }
}
