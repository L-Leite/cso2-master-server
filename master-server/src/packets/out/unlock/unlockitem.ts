import { OutPacketBase } from 'packets/out/packet'

export class UnlockItem {

    private ItemID:number
    private Seq:number
    private CostType:number     //1=mpoint,0=zpoint
    private UnlockCost:number

    constructor(
        ItemID:number,
        Seq:number,
        CostType:number,
        UnlockCost:number
    ) {
        this.ItemID = ItemID
        this.Seq = Seq
        this.CostType = CostType
        this.UnlockCost = UnlockCost
    }

    public build(outPacket: OutPacketBase):void{
        outPacket.writeUInt32(this.ItemID)
        outPacket.writeUInt32(this.Seq)
        outPacket.writeUInt8(this.CostType)
        outPacket.writeUInt32(this.UnlockCost)
    }
}

export let UnlockItemList: UnlockItem[] = [
    new UnlockItem(
        1,
        0x0B,
        0x01,
        0x3E8,
    ),
    new UnlockItem(
        9,
        0x0C,
        0x01,
        0x5DC,
    ),
    new UnlockItem(
        10,
        0x0D,
        0x01,
        0x3E8,
    ),
    new UnlockItem(
        24,
        0x0E,
        0x01,
        0x5DC,
    ),
    new UnlockItem(
        11,
        0x0F,
        0x01,
        0x708,
    ),
    new UnlockItem(
        60,
        0x10,
        0x01,
        0xBB80,
    ),
    new UnlockItem(
        31,
        0x11,
        0x01,
        0x5DC0,
    ),
    new UnlockItem(
        17,
        0x12,
        0x01,
        0x708,
    ),
    new UnlockItem(
        28,
        0x13,
        0x01,
        0x1D4C,
    ),
    new UnlockItem(
        59,
        0x14,
        0x01,
        0x6160,
    ),
    new UnlockItem(
        53,
        0x15,
        0x01,
        0x7530,
    ),
    new UnlockItem(
        26,
        0x16,
        0x01,
        0xFA0,
    ),
    new UnlockItem(
        25,
        0x17,
        0x01,
        0x3A98,
    ),
    new UnlockItem(
        63,
        0x18,
        0x01,
        0x493E0,
    ),
    new UnlockItem(
        20,
        0x19,
        0x01,
        0xFA0,
    ),
    new UnlockItem(
        7,
        0x1A,
        0x01,
        0x3A98,
    ),
    new UnlockItem(
        62,
        0x1B,
        0x01,
        0x493E0,
    ),
    new UnlockItem(
        5,
        0x1C,
        0x01,
        0x708,
    ),
    new UnlockItem(
        44,
        0x1D,
        0x01,
        0x7530,
    ),
    new UnlockItem(
        16,
        0x1E,
        0x01,
        0x1388,
    ),
    new UnlockItem(
        12,
        0x1F,
        0x01,
        0x4E20,
    ),
    new UnlockItem(
        22,
        0x20,
        0x01,
        0x4E20,
    ),
    new UnlockItem(
        52,
        0x43,
        0x01,
        0x7530,
    ),
    new UnlockItem(
        70,
        0x57,
        0x01,
        0x7A120,
    ),
    new UnlockItem(
        71,
        0x58,
        0x01,
        0x7A120,
    ),
    new UnlockItem(
        77,
        0x59,
        0x01,
        0x190,
    ),
    new UnlockItem(
        85,
        0x81,
        0x01,
        0x370,
    ),
    new UnlockItem(
        48,
        0x90,
        0x01,
        0x7530,
    ),
    new UnlockItem(
        29,
        0x91,
        0x01,
        0xEA60,
    ),
    new UnlockItem(
        32,
        0x92,
        0x01,
        0x1E848,
    ),
    new UnlockItem(
        37,
        0x93,
        0x01,
        0x30D40,
    ),
    new UnlockItem(
        106,
        0xA8,
        0x00,
        0x28,
    ),
    new UnlockItem(
        112,
        0xA9,
        0x00,
        0x50,
    ),
    new UnlockItem(
        111,
        0xAA,
        0x00,
        0x28,
    ),
    new UnlockItem(
        110,
        0xAB,
        0x00,
        0x50,
    ),
    new UnlockItem(
        105,
        0xAC,
        0x00,
        0x28,
    ),
    new UnlockItem(
        114,
        0xAD,
        0x00,
        0x50,
    ),
    new UnlockItem(
        107,
        0xAE,
        0x00,
        0x28,
    ),
    new UnlockItem(
        109,
        0xAF,
        0x00,
        0x50,
    ),
    new UnlockItem(
        74,
        0xD7,
        0x01,
        0xC350,
    ),
    new UnlockItem(
        75,
        0xD8,
        0x01,
        0x17700,
    ),
    new UnlockItem(
        78,
        0xE8,
        0x01,
        0x11170,
    ),
    new UnlockItem(
        82,
        0xE9,
        0x01,
        0x1D4C0,
    ),
    new UnlockItem(
        91,
        0x106,
        0x01,
        0x249F0,
    ),
    new UnlockItem(
        95,
        0x119,
        0x01,
        0xEA60,
    ),
    new UnlockItem(
        96,
        0x11A,
        0x01,
        0x1D4C0,
    ),
    new UnlockItem(
        100,
        0x138,
        0x01,
        0x249F0,
    ),
    new UnlockItem(
        104,
        0x15C,
        0x01,
        0x7A120,
    ),
    new UnlockItem(
        109,
        0x182,
        0x01,
        0x186A0,
    ),
    new UnlockItem(
        108,
        0x183,
        0x01,
        0x186A0,
    ),
    new UnlockItem(
        110,
        0x184,
        0x01,
        0x186A0,
    ),
    new UnlockItem(
        66,
        0x1FA,
        0x01,
        0x7530,
    ),
    new UnlockItem(
        67,
        0x1FB,
        0x01,
        0xC350,
    ),
    new UnlockItem(
        120,
        0x1FC,
        0x01,
        0x30D40,
    ),
    new UnlockItem(
        121,
        0x207,
        0x00,
        0xA0,
    ),
    new UnlockItem(
        124,
        0x208,
        0x00,
        0x104,
    ),
    new UnlockItem(
        122,
        0x209,
        0x00,
        0x1E0,
    ),
    new UnlockItem(
        123,
        0x20A,
        0x00,
        0x244,
    ),
    new UnlockItem(
        125,
        0x258,
        0x00,
        0x244,
    ),
    new UnlockItem(
        126,
        0x259,
        0x00,
        0x30C,
    ),
    new UnlockItem(
        129,
        0x291,
        0x01,
        0x249F0,
    ),
    new UnlockItem(
        130,
        0x292,
        0x01,
        0x75300,
    ),
    new UnlockItem(
        131,
        0x293,
        0x01,
        0x35B60,
    ),
    new UnlockItem(
        133,
        0x294,
        0x00,
        0x140,
    ),
    new UnlockItem(
        132,
        0x295,
        0x00,
        0x208,
    ),
    new UnlockItem(
        135,
        0x31F,
        0x00,
        0x208,
    ),
    new UnlockItem(
        138,
        0x3A4,
        0x01,
        0x493E0,
    ),
    new UnlockItem(
        143,
        0x444,
        0x01,
        0x3A980,
    ),
    new UnlockItem(
        144,
        0x445,
        0x01,
        0x57E40,
    ),
    new UnlockItem(
        145,
        0x446,
        0x01,
        0x75300,
    ),
    new UnlockItem(
        155,
        0x4A9,
        0x01,
        0x249F0,
    ),
    new UnlockItem(
        156,
        0x4AA,
        0x01,
        0x30D40,
    ),
    new UnlockItem(
        151,
        0x4FC,
        0x01,
        0x9942,
    ),
    new UnlockItem(
        152,
        0x4FD,
        0x01,
        0x22986,
    ),
    new UnlockItem(
        153,
        0x4FE,
        0x01,
        0x2ED8C,
    )
]
