import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { LobbyJoinRoom } from 'packets/out/lobby/joinroom'

enum OutLobbyType {
    JoinRoom = 1,
    UpdateUserInfo = 2,
}

/**
 * outgoing lobby information
 * @class OutLobbyPacket
 */
export class OutLobbyPacket extends OutPacketBase {
    constructor(seq: number) {
        super()
        this.sequence = seq
        this.packetId = PacketId.Lobby
    }

    public joinRoom(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 10, incrementAmount: 10 })

        this.buildHeader()
        this.writeUInt8(OutLobbyType.JoinRoom)

        new LobbyJoinRoom(0, 2, 4).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }
}
