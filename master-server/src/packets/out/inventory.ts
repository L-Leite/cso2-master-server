import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { OutInventoryAdd } from 'packets/out/inventory/add'
import { OutInventoryCreate } from 'packets/out/inventory/create'

import { UserInventoryItem } from 'user/userinventoryitem'

/**
 * outgoing room information
 * @class OutInventoryPacket
 */
export class OutInventoryPacket extends OutPacketBase {
    public static createInventory(
        items: UserInventoryItem[]
    ): OutInventoryPacket {
        const packet: OutInventoryPacket = new OutInventoryPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 80,
            incrementAmount: 20
        })

        packet.id = PacketId.Inventory_Create
        packet.buildHeader()

        OutInventoryCreate.build(items, packet)

        return packet
    }

    public static addInventory(items: UserInventoryItem[]): OutInventoryPacket {
        const packet: OutInventoryPacket = new OutInventoryPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 80,
            incrementAmount: 20
        })

        packet.id = PacketId.Inventory_Add
        packet.buildHeader()

        OutInventoryAdd.build(items, packet)

        return packet
    }
    constructor() {
        super(null)
    }
}
