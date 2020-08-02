import { Uint64LE } from 'int64-buffer'

import { OutPacketBase } from 'packets/out/packet'

/**
 * tells an user to join a host's match
 * @class OutHostJoinHost
 */
export class OutHostJoinHost {
    public static build(hostUserId: number, outPacket: OutPacketBase): void {
        outPacket.writeUInt32(hostUserId)
        outPacket.writeUInt64(new Uint64LE(0)) // unk00
    }
}
