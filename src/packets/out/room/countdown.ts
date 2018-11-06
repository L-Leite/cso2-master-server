import { OutPacketBase } from 'packets/out/packet'

/**
 * Sub structure of Room packet
 * @class OutRoomCountdown
 */
export class OutRoomCountdown {
    private unk00: number
    private count: number

    constructor(countdown: number) {
        this.unk00 = 0
        this.count = countdown
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt8(this.unk00)
        outPacket.writeUInt8(this.count)
    }
}
