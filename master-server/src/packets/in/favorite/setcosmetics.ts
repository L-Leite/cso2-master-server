import { InPacketBase } from 'packets/in/packet'

/**
 * requests an user's buy menu
 * @class InHostSetBuyMenu
 */
export class InFavoriteSetCosmetics {
    public slot: number
    public itemId: number

    constructor(inPacket: InPacketBase) {
        this.slot = inPacket.readUInt8()
        this.itemId = inPacket.readUInt32()
    }
}
