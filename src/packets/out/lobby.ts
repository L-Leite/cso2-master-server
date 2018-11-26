import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'
import { LobbySomeInfo } from './lobby/someinfo'

enum OutLobbyType {
    UnkType = 1,
}

/**
 * outgoing lobby information
 * @class UnkType
 */
export class OutLobbyPacket extends OutPacketBase {
    constructor(seq: number) {
        super()
        this.sequence = seq
        this.packetId = PacketId.Lobby
    }

    public doSomething(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 10, incrementAmount: 10 })

        this.buildHeader()
        this.writeUInt8(OutLobbyType.UnkType)

        new LobbySomeInfo(0, 2, 4).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }
}
