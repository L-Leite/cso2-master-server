import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'
import { ConfigListSomeInfo } from './configinfo/someinfo';

enum OutConfigInfoType {
    SetInfo = 1,
}

/**
 * outgoing config information
 * @class OutConfigInfoPacket
 */
export class OutConfigInfoPacket extends OutPacketBase {
    private unk00: number
    private unkArrayCount: number
    private unkArray: ConfigListSomeInfo[]

    constructor(seq: number) {
        super()
        this.sequence = seq
        this.packetId = PacketId.ConfigInfo

        this.unk00 = 36
        this.unkArrayCount = 25

        this.unkArray = [
            new ConfigListSomeInfo(57, 4, 0, 0),
            new ConfigListSomeInfo(1, 6, 0, 1),
            new ConfigListSomeInfo(58, 2, 0, 1),
            new ConfigListSomeInfo(2, 102, 0, 1),
            new ConfigListSomeInfo(59, 2, 0, 0),
            new ConfigListSomeInfo(3, 110, 0, 1),
            new ConfigListSomeInfo(60, 2, 0, 1),
            new ConfigListSomeInfo(4, 103, 0, 1),
            new ConfigListSomeInfo(61, 104, 0, 0),
            new ConfigListSomeInfo(5, 2, 3, 1),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
            new ConfigListSomeInfo(1, 2, 3, 4),
        ]
    }

    public setInfo(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 150, incrementAmount: 30 })

        this.buildHeader()
        this.writeUInt8(OutConfigInfoType.SetInfo)

        this.writeUInt8(this.unk00)
        this.writeUInt8(this.unkArrayCount)

        this.unkArray.forEach((element: ConfigListSomeInfo) => {
            element.build(this)
        });

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }
}
