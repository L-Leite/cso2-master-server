import { InPacketBase } from 'packets/in/packet'

/**
 * Sub structure of Room packet
 * @class InRoomCountdown
 */
export class InRoomCountdown {
    public unk00: number
    public count: number

    constructor(inPacket: InPacketBase) {
        this.unk00 = inPacket.readUInt8()
        this.count = inPacket.readUInt8()
    }
}
