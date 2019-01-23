import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { LobbyJoinRoom } from 'packets/out/lobby/joinroom'

import { ExtendedSocket } from 'extendedsocket'

enum OutLobbyType {
    JoinRoom = 1,
    UpdateUserInfo = 2,
}

/**
 * outgoing lobby information
 * @class OutLobbyPacket
 */
export class OutLobbyPacket extends OutPacketBase {
    constructor(socket: ExtendedSocket) {
        super(socket, PacketId.Lobby)
    }

    public joinRoom(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 16, incrementAmount: 4 })

        this.buildHeader()
        this.writeUInt8(OutLobbyType.JoinRoom)

        new LobbyJoinRoom(0, 2, 4).build(this)

        return this.getData()
    }
}
