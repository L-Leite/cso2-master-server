import { InPacketBase } from 'packets/in/packet'

/**
 * requests an user's buy menu
 * @class InHostSetBuyMenu
 */
export class InHostSetBuyMenu {
    public userId: number

    constructor(inPacket: InPacketBase) {
        this.userId = inPacket.readUInt32()
    }
}
