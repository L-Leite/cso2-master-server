import { OutPacketBase } from 'packets/out/packet'

/**
 * contains a message destinated to an user's current room
 */
export class OutChatDefaultMsg {
    public static build(
        sender: string,
        vipLevel: number,
        message: string,
        outPacket: OutPacketBase
    ): void {
        outPacket.writeString(sender)

        outPacket.writeUInt8(vipLevel !== 0 ? 1 : 0)
        outPacket.writeUInt8(vipLevel)

        outPacket.writeLongString(message)
    }
}
