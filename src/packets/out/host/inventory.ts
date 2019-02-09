import { OutPacketBase } from 'packets/out/packet'

import { UserInventoryItem } from 'user/userinventoryitem'

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
    private items: UserInventoryItem[]

    constructor(userId: number, items: UserInventoryItem[]) {
        this.userId = userId
        this.unk00 = 0

        this.items = items
        this.numOfItems = this.items.length
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt32(this.userId)
        outPacket.writeUInt8(this.unk00)

        outPacket.writeUInt16(this.numOfItems)

        for (const item of this.items) {
            outPacket.writeUInt32(item.id)
            outPacket.writeUInt16(item.count)
        }
    }
}
