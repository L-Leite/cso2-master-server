import { OutPacketBase } from 'packets/out/packet'

import { PacketLongString } from 'packets/packetlongstring'
import { PacketString } from 'packets/packetstring'

/**
 * Send a message with arbitrary content to the user
 */
export class OutChatAnyMessage {
    public static build(message: string, type: number, outPacket: OutPacketBase): void {

        if (type === 11) {
            outPacket.writeUInt8(0) // unknown
            outPacket.writeString(new PacketString(message))
        } else {
            outPacket.writeLongString(new PacketLongString(message))
        }
    }
}
