import { OutPacketBase } from 'packets/out/packet'

/**
 * sends an user's inventory to a host
 * @class OutHostPreloadInventory
 */
export class OutHostSetInventory {
    private userId: number

    // writes somewhere to CGameClient
    private unk00: number

    // these are unconfirmed
    private numOfItems: number
    private items: number[]
    private itemsQuant: number[]

    constructor(userId: number, items: number[]) {
        this.userId = userId
        this.unk00 = 0

        this.items = items
        this.itemsQuant = []
        this.numOfItems = this.items.length
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt32(this.userId)
        outPacket.writeUInt8(this.unk00)

        outPacket.writeUInt16(this.numOfItems)

        for (let i: number = 0; i < this.numOfItems; i++) {
            const item: number = this.items[i]
            const quant: number = 1 // this.itemQuant[i]

            outPacket.writeUInt32(item)
            outPacket.writeUInt16(quant)
        }
    }
}
