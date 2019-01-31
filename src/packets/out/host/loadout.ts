import { OutPacketBase } from 'packets/out/packet'

import { UserLoadout } from 'user/userloadout'

/**
 * sends an user's loadout to a host
 * @class OutHostPreloadInventory
 */
export class OutHostLoadout {
    private outPacket: OutPacketBase
    private curItem: number

    private userId: number

    // cosmetics
    private ctClassItem: number
    private terClassItem: number
    private headItem: number
    private gloveItem: number
    private backItem: number
    private stepsItem: number
    private cardItem: number
    private sprayItem: number

    private loadouts: UserLoadout[]

    private unk00: number

    constructor(userId: number, ctClassItem: number, terClassItem: number,
                headItem: number, gloveItem: number, backItem: number,
                stepsItem: number, cardItem: number, sprayItem: number,
                loadouts: UserLoadout[]) {
        this.outPacket = null
        this.curItem = 0

        this.userId = userId
        this.ctClassItem = ctClassItem
        this.terClassItem = terClassItem
        this.headItem = headItem
        this.gloveItem = gloveItem
        this.backItem = backItem
        this.stepsItem = stepsItem
        this.cardItem = cardItem
        this.sprayItem = sprayItem

        this.loadouts = loadouts

        this.unk00 = 0
    }

    public build(outPacket: OutPacketBase): void {
        this.outPacket = outPacket

        this.outPacket.writeUInt32(this.userId)
        this.outPacket.writeUInt8(8) // num of cosmetics

        this.writeItem(this.ctClassItem)
        this.writeItem(this.terClassItem)
        this.writeItem(this.headItem)
        this.writeItem(this.gloveItem)
        this.writeItem(this.backItem)
        this.writeItem(this.stepsItem)
        this.writeItem(this.cardItem)
        this.writeItem(this.sprayItem)

        this.outPacket.writeUInt8(this.loadouts.length)

        for (const loadout of this.loadouts) {
            this.outPacket.writeInt8(loadout.items.length)
            this.curItem = 0
            for (const item of loadout.items) {
                this.writeItem(item)
            }
        }

        this.outPacket.writeUInt8(this.unk00)
    }

    private writeItem(itemNum: number): void {
        this.outPacket.writeUInt8(this.curItem++)
        this.outPacket.writeUInt32(itemNum)
    }
}
