import { InPacketBase } from 'packets/in/packet'

/**
 * requests an user's item use
 * @class InHostItemUsing
 */
export class InHostItemUsed {
    public userId: number
    public itemId: number

    constructor(inPacket: InPacketBase) {
        this.userId = inPacket.readUInt32()
        this.itemId = inPacket.readUInt32()
    }
}
