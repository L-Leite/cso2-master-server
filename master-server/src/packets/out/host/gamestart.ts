import { OutPacketBase } from 'packets/out/packet'

/**
 * tells a host to start a match
 * @class OutHostGameStart
 */
export class OutHostGameStart {
    public static build(hostUserId: number, outPacket: OutPacketBase): void {
        outPacket.writeUInt32(hostUserId)
    }
}
