import { OutInventoryBaseItem } from 'packets/out/inventory/baseitem'

import { OutPacketBase } from 'packets/out/packet'

import { Uint64LE } from 'int64-buffer'

/**
 * @class OutInventorySomething
 */
export class OutInventoryItem extends OutInventoryBaseItem {
    private unk06: Uint64LE

    constructor(itemNum: number, itemId: number) {
        super(itemNum, itemId)
        this.unk06 = new Uint64LE(0)
    }

    public build(outPacket: OutPacketBase): void {
        super.build(outPacket)
        outPacket.writeUInt64(this.unk06)
    }
}
