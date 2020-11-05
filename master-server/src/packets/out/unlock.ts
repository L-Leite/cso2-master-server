import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'

import { OutPacketBase } from 'packets/out/packet'
import { OutUnlockInfo } from 'packets/out/unlock/info'
import { OutUnlockKills } from 'packets/out/unlock/killnum'

export class OutUnlockPacket extends OutPacketBase {
    public static createUnlockInfo(): OutUnlockPacket {
        const packet = new OutUnlockPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 80,
            incrementAmount: 20
        })

        packet.buildHeader()
        packet.writeUInt8(1)        //unk00, type ?

        //build unlock weapons info
        OutUnlockInfo.build(packet)

        //build killNum
        OutUnlockKills.build(packet)

        //build ID list
        packet.writeUInt16(1)        //ID list array length,to be continued...
        packet.writeUInt32(1)        //test item id
        return packet
    }

    constructor() {
        super(PacketId.Unlock)
    }
}
