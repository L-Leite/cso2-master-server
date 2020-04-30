import { OutPacketBase } from 'packets/out/packet'

import { PacketLongString } from 'packets/packetlongstring'
import { PacketString } from 'packets/packetstring'

import { ChatMessageType } from 'packets/definitions'

/**
 * Send a message with arbitrary content to the user
 */
export class OutChatSystemMsg {
    public static build(message: string, type: ChatMessageType, outPacket: OutPacketBase): void {

        if (type === ChatMessageType.Congratulate) {
            outPacket.writeUInt8(0) // unknown
            outPacket.writeString(new PacketString(message))
        } else {
            outPacket.writeLongString(new PacketLongString(message))
        }
    }
}
