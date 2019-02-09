import { OutInventoryBaseItem } from 'packets/out/inventory/baseitem'
import { OutInventoryItem } from 'packets/out/inventory/item'

import { OutPacketBase } from 'packets/out/packet'

import { UserInventoryItem } from 'user/userinventoryitem'

/**
 * same as OutInventoryCreate
 * was used to add the base weapons (glock, usp, scout, ...)
 * to the user's inventory
 * @class OutInventoryAdd
 */
export class OutInventoryAdd {
    private items: OutInventoryBaseItem[]

    constructor(items: UserInventoryItem[]) {
        this.items = []

        let curItem: number = 0
        for (const item of items) {
            this.items.push(new OutInventoryItem(curItem++, item.id, item.count))
        }
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt16(this.items.length)
        for (const item of this.items) {
            item.build(outPacket)
        }
    }
}
