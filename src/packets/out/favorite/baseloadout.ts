import { OutPacketBase } from 'packets/out/packet'

/**
 * @class OutFavoriteLoadout
 */
export class OutFavoriteBaseLoadout {
    public loadoutNum: number
    public items: number[]

    constructor(loadoutNum: number, items: number[]) {
        this.loadoutNum = loadoutNum
        this.items = items
    }

    public write(outPacket: OutPacketBase): void {
        let curItem = 0

        for (const item of this.items) {
            outPacket.writeUInt8(this.loadoutNum)
            outPacket.writeUInt8(curItem++)
            outPacket.writeUInt32(item)
        }
    }
}
