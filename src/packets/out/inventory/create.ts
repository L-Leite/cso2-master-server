import { OutInventoryItem } from 'packets/out/inventory/item'

import { OutPacketBase } from 'packets/out/packet'

import { UserInventoryItem } from 'user/userinventoryitem'

/**
 * @class OutInventoryCreate
 */
export class OutInventoryCreate {
    public static build(items: UserInventoryItem[], outPacket: OutPacketBase): void {
        outPacket.writeUInt16(items.length)

        let curItem: number = 0
        for (const item of items) {
            new OutInventoryItem(curItem++, item.item_id, item.ammount).build(outPacket)
        }
    }
}
