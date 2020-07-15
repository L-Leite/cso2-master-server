import { OutPacketBase } from 'packets/out/packet'
import { UserInventoryItem } from 'user/userinventoryitem'

/**
 * sends an user's inventory to a host
 */
export class OutHostSetInventory {
    public static build(userId: number, items: UserInventoryItem[], outPacket: OutPacketBase): void {
        outPacket.writeUInt32(userId)

         // writes somewhere to CGameClient
        outPacket.writeUInt8(0) // unk00

        // these are unconfirmed
        outPacket.writeUInt16(items.length) // numOfItems
        for (const item of items) {
            outPacket.writeUInt32(item.item_id)
            outPacket.writeUInt16(item.ammount)
        }
    }
}
