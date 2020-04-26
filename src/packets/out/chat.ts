
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

    public static directMessage(sender: string, vL: number, t: string, isT: boolean, message: string): OutChatPacket {
        // original: sender, vipLevel, target, isTarget, message (TypeScript has max 120 words limit on every line)
        const packet: OutChatPacket = new OutChatPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 32, incrementAmount: 64 })

        packet.buildHeader()
        packet.writeUInt8(ChatMessageType.DirectMessage)
        packet.writeUInt8(0) // is GM?
        packet.writeUInt8(isT ? 1 : 0) // is direct message's target?

        OutChatDefaultMsg.build(isT ? sender : t, vL, message, packet)

        return packet
    }

    public static roomMessage(sender: string, teamNum: number, message: string): OutChatPacket {
        const packet: OutChatPacket = new OutChatPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 32, incrementAmount: 64 })

        packet.buildHeader()
        packet.writeUInt8(ChatMessageType.Room)
        packet.writeUInt8(0) // is GM?

        OutChatDefaultMsg.build(sender, teamNum, message, packet)

        return packet
    }

    public static ingameMessage(sender: string, teamNum: number, message: string): OutChatPacket {
        const packet: OutChatPacket = new OutChatPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 32, incrementAmount: 64 })

        packet.buildHeader()
        packet.writeUInt8(ChatMessageType.IngameGlobal)
        packet.writeUInt8(0) // is GM?

        OutChatDefaultMsg.build(sender, teamNum, message, packet)

        return packet
    }

    public static ingameTeamMessage(sender: string, teamNum: number, message: string): OutChatPacket {
        const packet: OutChatPacket = new OutChatPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 32, incrementAmount: 64 })

        packet.buildHeader()
        packet.writeUInt8(ChatMessageType.IngameTeam)
        packet.writeUInt8(0) // is GM?

        OutChatDefaultMsg.build(sender, teamNum, message, packet)

        return packet
    }

    constructor() {
        super(PacketId.Chat)
    }

}
