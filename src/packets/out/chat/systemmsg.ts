import { OutPacketBase } from 'packets/out/packet'

import { ChatMessageType } from 'packets/definitions'

/**
 * Send a message with arbitrary content to the user
 */
export class OutChatSystemMsg {
    public static build(
        message: string,
        type: ChatMessageType,
        outPacket: OutPacketBase
    ): void {
        if (type === ChatMessageType.Congratulate) {
            outPacket.writeUInt8(0) // unknown
            outPacket.writeString(message)
        } else {
            outPacket.writeLongString(message)
        }
    }
}
