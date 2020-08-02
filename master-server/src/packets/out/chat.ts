import { WritableStreamBuffer } from 'stream-buffers'

import { ChatMessageType, PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { OutChatDefaultMsg } from 'packets/out/chat/defaultmsg'
import { OutChatSystemMsg } from 'packets/out/chat/systemmsg'

export class OutChatPacket extends OutPacketBase {
    public static channelMessage(
        sender: string,
        isGm: boolean,
        message: string
    ): OutChatPacket {
        const packet: OutChatPacket = new OutChatPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 32,
            incrementAmount: 64
        })

        packet.buildHeader()
        packet.writeUInt8(ChatMessageType.Channel)
        packet.writeUInt8(isGm ? 1 : 0) // is GM?

        OutChatDefaultMsg.build(sender, null, message, packet)

        return packet
    }

    public static directMessage(
        sender: string,
        vipLevel: number,
        isGm: boolean,
        target: string,
        isTarget: boolean,
        message: string
    ): OutChatPacket {
        const packet: OutChatPacket = new OutChatPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 32,
            incrementAmount: 64
        })

        packet.buildHeader()
        packet.writeUInt8(ChatMessageType.DirectMessage)
        packet.writeUInt8(isGm ? 1 : 0) // is GM?
        packet.writeUInt8(isTarget ? 1 : 0) // is direct message's target?

        OutChatDefaultMsg.build(
            isTarget ? sender : target,
            vipLevel,
            message,
            packet
        )

        return packet
    }

    public static roomMessage(
        sender: string,
        vipLevel: number,
        isGm: boolean,
        message: string
    ): OutChatPacket {
        const packet: OutChatPacket = new OutChatPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 32,
            incrementAmount: 64
        })

        packet.buildHeader()
        packet.writeUInt8(ChatMessageType.Room)
        packet.writeUInt8(isGm ? 1 : 0) // is GM?

        OutChatDefaultMsg.build(sender, vipLevel, message, packet)

        return packet
    }

    public static ingameMessage(
        sender: string,
        vipLevel: number,
        isGm: boolean,
        message: string
    ): OutChatPacket {
        const packet: OutChatPacket = new OutChatPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 32,
            incrementAmount: 64
        })

        packet.buildHeader()
        packet.writeUInt8(ChatMessageType.IngameGlobal)
        packet.writeUInt8(isGm ? 1 : 0) // is GM?

        OutChatDefaultMsg.build(sender, vipLevel, message, packet)

        return packet
    }

    public static ingameTeamMessage(
        sender: string,
        vipLevel: number,
        isGm: boolean,
        message: string
    ): OutChatPacket {
        const packet: OutChatPacket = new OutChatPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 32,
            incrementAmount: 64
        })

        packet.buildHeader()
        packet.writeUInt8(ChatMessageType.IngameTeam)
        packet.writeUInt8(isGm ? 1 : 0) // is GM?

        OutChatDefaultMsg.build(sender, vipLevel, message, packet)

        return packet
    }

    public static systemMessage(
        message: string,
        type: ChatMessageType
    ): OutChatPacket {
        const packet: OutChatPacket = new OutChatPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 32,
            incrementAmount: 64
        })

        packet.buildHeader()
        packet.writeUInt8(type)

        OutChatSystemMsg.build(message, type, packet)

        return packet
    }

    constructor() {
        super(PacketId.Chat)
    }
}
