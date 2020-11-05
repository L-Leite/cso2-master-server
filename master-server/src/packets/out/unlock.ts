import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { ShopItem } from 'gametypes/shopitem'

import { OutPacketBase } from 'packets/out/packet'
import { OutUnlockInfo } from 'packets/out/unlock/unlockinfo'

export class OutUnlockPacket extends OutPacketBase {
    public static createUnlockInfo(): OutUnlockPacket {
        const packet = new OutUnlockPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 80,
            incrementAmount: 20
        })

        packet.buildHeader()
        packet.writeUInt8(1)        //unk00, type ?

        OutUnlockInfo.build()

        return packet
    }

    constructor() {
        super(PacketId.Unlock)
    }
}
