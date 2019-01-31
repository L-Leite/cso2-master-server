import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { OutInventoryAdd } from 'packets/out/inventory/add'
import { OutInventoryCreate } from 'packets/out/inventory/create'

import { ExtendedSocket } from 'extendedsocket'

/**
 * outgoing room information
 * @class OutInventoryPacket
 */
export class OutInventoryPacket extends OutPacketBase {
    constructor(socket: ExtendedSocket) {
        super(socket, null)
    }

    public createInventory(items: number[]): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 80, incrementAmount: 20 })

        this.id = PacketId.Inventory_Create
        this.buildHeader()

        new OutInventoryCreate(items).build(this)

        return this.getData()
    }

    public addInventory(items: number[]): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 80, incrementAmount: 20 })

        this.id = PacketId.Inventory_Add
        this.buildHeader()

        new OutInventoryAdd(items).build(this)

        return this.getData()
    }
}
