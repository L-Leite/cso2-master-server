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

    public static joinRoom(): OutLobbyPacket {
        const packet: OutLobbyPacket = new OutLobbyPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 16, incrementAmount: 4 })

        packet.buildHeader()
        packet.writeUInt8(OutLobbyType.JoinRoom)

        LobbyJoinRoom.build(0, 2, 4, packet)

        return packet
    }
    constructor() {
        super(PacketId.Lobby)
    }
}
