import { InPacketBase } from 'packets/in/packet'

/**
 * received when an user buys something
 * note: it can receive multiple items, but the game should always send one item
 */
export class InHostIngame_BuyItem {
    public buyerId: number
    public numItemsBought: number
    public itemsBought: number[]

    public GetItemBought(): number {
        if (this.itemsBought.length !== 1) {
            return -1
        }

        return this.itemsBought[0]
    }

    constructor(inPacket: InPacketBase) {
        this.buyerId = inPacket.readUInt32()
        this.numItemsBought = inPacket.readUInt8()

        if (this.numItemsBought > 1) {
            console.warn('InHostIngame_BuyItem: more than one item was bought')
        }

        this.itemsBought = []

        for (let i = 0; i < this.numItemsBought; i++) {
            this.itemsBought.push(inPacket.readUInt32())
        }
    }
}
