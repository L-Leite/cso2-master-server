import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { ShopItem } from 'gametypes/shopitem'

import { OutPacketBase } from 'packets/out/packet'
import { OutShopCreate } from 'packets/out/shop/create'

export class OutShopPacket extends OutPacketBase {
    public static createShop(items: ShopItem[]): OutShopPacket {
        const packet = new OutShopPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 80,
            incrementAmount: 20
        })

        packet.buildHeader()
        packet.writeUInt8(0)

        OutShopCreate.build(items, packet)

        return packet
    }

    constructor() {
        super(PacketId.Shop)
    }
}
