import { OutPacketBase } from 'packets/out/packet'

/**
 * @class OutInventoryBaseItem
 */
export class OutInventoryBaseItem {
    private itemNum: number
    private unk01: number
    private itemId: number
    private itemCount: number
    private unk04: number
    private unk05: number

    constructor(itemNum: number, itemId: number, itemCount: number) {
        this.itemNum = itemNum
        this.unk01 = 1
        this.itemId = itemId
        this.itemCount = itemCount
        this.unk04 = 1 // type
        this.unk05 = 0
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt16(this.itemNum)
        outPacket.writeUInt8(this.unk01)
        outPacket.writeUInt32(this.itemId)
        outPacket.writeUInt16(this.itemCount)
        outPacket.writeUInt8(this.unk04)
        outPacket.writeUInt8(this.unk05)
    }
}
