import { InPacketBase } from 'packets/in/packet'

/**
 * requests an user's inventory
 * @class InHostSetInventory
 */
export class InHostSetInventory {
    public userId: number

    constructor(inPacket: InPacketBase) {
        this.userId = inPacket.readUInt32()
    }
}
