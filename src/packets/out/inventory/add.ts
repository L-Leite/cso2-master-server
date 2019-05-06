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
    public static build(items: UserInventoryItem[], outPacket: OutPacketBase): void {
        outPacket.writeUInt16(items.length)

        let curItem: number = 0
        for (const item of items) {
            new OutInventoryItem(curItem++, item.itemId, item.ammount).build(outPacket)
        }
    }
}
