import { InPacketBase } from 'packets/in/packet'

/**
 * requests an user's buy menu
 * @class InHostSetBuyMenu
 */
export class InFavoriteSetLoadout {
    public loadout: number
    public weaponSlot: number
    public itemId: number

    constructor(inPacket: InPacketBase) {
        this.loadout = inPacket.readUInt8()
        this.weaponSlot = inPacket.readUInt8()
        this.itemId = inPacket.readUInt32()
    }
}
