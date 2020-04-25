
import { WritableStreamBuffer } from 'stream-buffers'

import { ChatMessageType, PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { OutChatDefaultMsg } from 'packets/out/chat/defaultmsg'

export class OutChatPacket extends OutPacketBase {
    public static channelMessage(sender: string, message: string): OutChatPacket {
        const packet: OutChatPacket = new OutChatPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 32, incrementAmount: 64 })

        packet.buildHeader()
        packet.writeUInt8(ChatMessageType.Channel)
        packet.writeUInt8(0) // some subtype?

        OutChatDefaultMsg.build(sender, null, message, packet)

        return packet
    }

    public static directMessage(sender: string, message: string): OutChatPacket {
        const packet: OutChatPacket = new OutChatPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 32, incrementAmount: 64 })

        packet.buildHeader()
        packet.writeUInt8(ChatMessageType.DirectMessage)
        packet.writeUInt8(0) // some subtype?
        packet.writeUInt8(0) // unknown

        OutChatDefaultMsg.build(sender, null, message, packet)

        return packet
    }

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
