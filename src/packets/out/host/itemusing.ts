import { OutPacketBase } from 'packets/out/packet'

/**
 * sends an user's item use
 */

export class OutHostItemUsing {
    public static build(
        userId: number,
        itemId: number,
        outPacket: OutPacketBase
    ): void {
        outPacket.writeUInt32(userId)
        outPacket.writeUInt32(itemId)
        outPacket.writeUInt8(1) // how many left the item in your inventory.
        // for Leite: you can change it at any time to match the result you want
    }
}
