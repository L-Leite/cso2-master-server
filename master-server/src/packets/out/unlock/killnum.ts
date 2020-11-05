import { OutPacketBase } from 'packets/out/packet'

export class OutUnlockKills {
    public static build(outPacket: OutPacketBase): void {
        outPacket.writeUInt16(1)        // length of the UnlockKillNum array

        let testKillnum = new UnlockKillNum(2,1,20,0,0)     // to test the packet 
        testKillnum.build(outPacket)       //test
    }
}

class UnlockKillNum{
    private PreItemID:number        //previous weapon itemid
    private ItemID:number           //current weapon itemid
    private kills:number            //current weapon killnum
    private unk00:number            //unkown size
    private unk01:number            //unkown size

    constructor(
        PreItemID:number,
        ItemID:number,
        kills:number,
        unk00:number,
        unk01:number
    ) {
        this.PreItemID = PreItemID
        this.ItemID = ItemID
        this.kills = kills
        this.unk00 = unk00
        this.unk01 = unk01
    }

    public build(outPacket: OutPacketBase):void{
        outPacket.writeUInt32(this.PreItemID)
        outPacket.writeUInt32(this.ItemID)
        outPacket.writeUInt32(this.kills)
        outPacket.writeUInt32(this.unk00)   //unk,maybe uint32
        outPacket.writeUInt16(this.unk01)   //unk,maybe uint16
    }
}