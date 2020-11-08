import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'

import { OutPacketBase } from 'packets/out/packet'
import { UnlockItem, UnlockProgress } from 'gametypes/unlockitem'

export class OutUnlockPacket extends OutPacketBase {
    public static createUnlockInfo(
        items: UnlockItem[],
        itemsProgress: UnlockProgress[]
    ): OutUnlockPacket {
        const packet = new OutUnlockPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 80,
            incrementAmount: 20
        })

        packet.buildHeader()
        packet.writeUInt8(1) // unlock packet subtype

        // build unlock weapons info
        packet.writeUInt16(items.length)

        let nextItemId = 1

        for (const item of items) {
            packet.writeUInt32(item.itemId)
            packet.writeUInt32(nextItemId++)
            packet.writeUInt8(item.currency)
            packet.writeUInt32(item.price)
        }

        // build killNum
        packet.writeUInt16(items.length)

        for (const progress of itemsProgress) {
            packet.writeUInt32(progress.parentItemId)
            packet.writeUInt32(progress.targetItemId)
            packet.writeUInt32(progress.kills)
            packet.writeUInt32(0)
            packet.writeUInt16(0)
        }

        // build ID list
        packet.writeUInt16(1) // ID list array length,to be continued...
        packet.writeUInt32(1) // test item id
        return packet
    }

    constructor() {
        super(PacketId.Unlock)
    }
}
