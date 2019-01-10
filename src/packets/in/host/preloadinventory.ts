import { InPacketBase } from 'packets/in/packet'

/**
 * preloads an user's inventory by using its entity number
 * @class InHostUserEntityNum
 */
export class InHostPreloadInventory {
    public entityNum: number

    constructor(inPacket: InPacketBase) {
        this.entityNum = inPacket.readUInt32()
    }
}
