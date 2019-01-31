import { OutPacketBase } from 'packets/out/packet'

/**
 * @class OutOptionBuySubMenu
 */
export class OutOptionBuySubMenu {
    private curItem: number
    private outPacket: OutPacketBase

    private items: number[]

    constructor(items: number[]) {
        this.curItem = 0
        this.outPacket = null

        this.items = items
    }

    public build(outPacket: OutPacketBase): void {
        this.outPacket = outPacket

        outPacket.writeUInt8(this.items.length) // the ammount of items being sent
        for (const item of this.items) {
            this.writeItem(item)
        }
    }

    private writeItem(itemNum: number): void {
        this.outPacket.writeUInt8(this.curItem++)
        this.outPacket.writeUInt32(itemNum)
    }
}
