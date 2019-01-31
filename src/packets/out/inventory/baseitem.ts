import { OutPacketBase } from 'packets/out/packet'

/**
 * @class OutInventoryBaseItem
 */
export class OutInventoryBaseItem {
    private itemNum: number
    private unk01: number
    private itemId: number
    private unk03: number
    private unk04: number
    private unk05: number

    constructor(itemNum: number, itemId: number) {
        this.itemNum = itemNum
        this.unk01 = 1
        this.itemId = itemId
        this.unk03 = 1
        this.unk04 = 1 // type
        this.unk05 = 0
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt16(this.itemNum)
        outPacket.writeUInt8(this.unk01)
        outPacket.writeUInt32(this.itemId)
        outPacket.writeUInt16(this.unk03)
        outPacket.writeUInt8(this.unk04)
        outPacket.writeUInt8(this.unk05)
    }
}
