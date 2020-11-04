import { Uint64LE } from 'int64-buffer'

import { OutPacketBase } from 'packets/out/packet'
import { ShopItem } from 'gametypes/shopitem'

export class OutShopCreate {
    public static build(items: ShopItem[], outPacket: OutPacketBase): void {
        outPacket.writeUInt16(items.length)

        let nextOptIndex = 1

        for (const item of items) {
            outPacket.writeUInt32(item.itemId)
            outPacket.writeUInt8(item.payCurrency)

            outPacket.writeUInt8(item.payOptions.length)

            for (const option of item.payOptions) {
                outPacket.writeUInt32(nextOptIndex++)
                outPacket.writeUInt16(option.quantity)
                outPacket.writeUInt64(new Uint64LE(0))
                outPacket.writeUInt8(0)
                outPacket.writeUInt16(1)
                outPacket.writeUInt32(option.previousPrice)
                outPacket.writeUInt32(option.price)
                outPacket.writeUInt8(option.discountPercent)
                outPacket.writeUInt32(0)
                outPacket.writeUInt32(0)
                outPacket.writeUInt8(option.flags)
                outPacket.writeUInt8(0)
                outPacket.writeUInt8(1)
                outPacket.writeUInt8(0)
                outPacket.writeUInt32(option.mileageReward)
                outPacket.writeUInt8(0)
                outPacket.writeUInt8(0)
            }
        }
    }
}
