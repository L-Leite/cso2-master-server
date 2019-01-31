import { OutPacketBase } from 'packets/out/packet'

/**
 * @class OutFavoriteCosmetics
 */
export class OutFavoriteCosmetics {
    private curItem: number
    private outPacket: OutPacketBase

    private ctModelItemId: number
    private terModelItemId: number
    private headItemId: number
    private gloveItemId: number
    private backItemId: number
    private unk00: number
    private unk01: number
    private unk02: number
    private unk03: number
    private unk04: number

    constructor(ctModelItem: number, terModelItem: number, headItem: number,
                gloveItem: number, backItem: number, stepsItem: number,
                cardItem: number, sprayItem: number) {
        this.curItem = 0
        this.outPacket = null

        this.ctModelItemId = ctModelItem
        this.terModelItemId = terModelItem
        this.headItemId = headItem
        this.gloveItemId = gloveItem
        this.backItemId = backItem
        this.unk00 = stepsItem
        this.unk01 = cardItem
        this.unk02 = sprayItem
        this.unk03 = 0
        this.unk04 = 0
    }

    public build(outPacket: OutPacketBase): void {
        this.outPacket = outPacket

        outPacket.writeUInt8(10) // the ammount of items being sent
        this.writeItem(this.ctModelItemId)
        this.writeItem(this.terModelItemId)
        this.writeItem(this.headItemId)
        this.writeItem(this.gloveItemId)
        this.writeItem(this.backItemId)
        this.writeItem(this.unk00)
        this.writeItem(this.unk01)
        this.writeItem(this.unk02)
        this.writeItem(this.unk03)
        this.writeItem(this.unk04)
    }

    private writeItem(itemNum: number): void {
        this.outPacket.writeUInt8(this.curItem++)
        this.outPacket.writeUInt32(itemNum)
    }
}
