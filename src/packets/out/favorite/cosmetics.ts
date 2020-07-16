import { OutPacketBase } from 'packets/out/packet'

/**
 * @class OutFavoriteCosmetics
 */
export class OutFavoriteCosmetics {
    public static build(
        ctItem: number,
        terItem: number,
        headItem: number,
        gloveItem: number,
        backItem: number,
        stepsItem: number,
        cardItem: number,
        sprayItem: number,
        outPacket: OutPacketBase
    ): void {
        outPacket.writeUInt8(10) // the ammount of items being sent

        let curItem = 0
        this.writeItem(ctItem, curItem++, outPacket)
        this.writeItem(terItem, curItem++, outPacket)
        this.writeItem(headItem, curItem++, outPacket)
        this.writeItem(gloveItem, curItem++, outPacket)
        this.writeItem(backItem, curItem++, outPacket)
        this.writeItem(stepsItem, curItem++, outPacket)
        this.writeItem(cardItem, curItem++, outPacket)
        this.writeItem(sprayItem, curItem++, outPacket)
        this.writeItem(0, curItem++, outPacket) // unk03
        this.writeItem(0, curItem++, outPacket) // unk04
    }

    private static writeItem(
        itemNum: number,
        curItem: number,
        outPacket: OutPacketBase
    ): void {
        outPacket.writeUInt8(curItem)
        outPacket.writeUInt32(itemNum)
    }
}
