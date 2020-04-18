
import { WritableStreamBuffer } from 'stream-buffers'

import { ChatMessageType, PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { OutChatDefaultMsg } from 'packets/out/chat/defaultmsg'

export class OutChatPacket extends OutPacketBase {
    public static roomMessage(sender: string, teamNum: number, message: string): OutChatPacket {
        const packet: OutChatPacket = new OutChatPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 32, incrementAmount: 64 })

        packet.buildHeader()
        packet.writeUInt8(ChatMessageType.Room)
        packet.writeUInt8(0) // some subtype?

        OutChatDefaultMsg.build(sender, teamNum, message, packet)

        return packet
    }

    public static ingameMessage(sender: string, teamNum: number, message: string): OutChatPacket {
        const packet: OutChatPacket = new OutChatPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 32, incrementAmount: 64 })

        packet.buildHeader()
        packet.writeUInt8(ChatMessageType.IngameGlobal)
        packet.writeUInt8(0) // some subtype?

        OutChatDefaultMsg.build(sender, teamNum, message, packet)

        return packet
    }

    public static ingameTeamMessage(sender: string, teamNum: number, message: string): OutChatPacket {
        const packet: OutChatPacket = new OutChatPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 32, incrementAmount: 64 })

        packet.buildHeader()
        packet.writeUInt8(ChatMessageType.IngameTeam)
        packet.writeUInt8(0) // some subtype?

        OutChatDefaultMsg.build(sender, teamNum, message, packet)

        return packet
    }

    constructor() {
        super(PacketId.Chat)
    }

}
