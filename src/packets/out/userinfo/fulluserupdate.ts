import { Uint64LE } from 'int64-buffer'

import { OutPacketBase } from 'packets/out/packet'
import { PacketString } from 'packets/packetstring'

import { User } from 'user/user'

/**
 * sends out an user's data
 * @class UserInfoFullUpdate
 */
export class UserInfoFullUpdate {
    // private userId: number
    private flags: number // should always be 0xFFFFFFFF for a full update
    // flag & 0x1
    private unk00: Uint64LE // nexon id?
    // end flag & 0x1
    // flag & 0x2
    private userName: PacketString
    // end of flag & 0x2
    // flag & 0x4
    private level: number
    // end of flag & 0x4
    // flag & 0x8
    private curExp: Uint64LE
    private maxExp: Uint64LE
    private unk03: number
    // end of flag & 0x8
    // flag & 0x10
    private rank: number
    private unk05: number
    // end of flag & 0x10
    // flag & 0x20
    private unk06: Uint64LE
    // end of flag & 0x20
    // flag & 0x40
    private unk07: number
    private wins: number
    private kills: number
    private unk10: number
    private deaths: number
    private assists: number
    private unk13: number
    private unk14: number
    private unk15: number
    private unk16: number
    private unk17: number
    private unk18: Uint64LE
    private unk19: number
    private unk20: number
    private unk21: number
    private unk22: number
    private unk23: number
    private unk24: number
    private unk25: number
    // end of flag & 0x40
    // if flags < 0
    private unk26: PacketString
    private unk27: number
    private unk28: number
    private unk29: number
    private unk30: number
    private unk31: PacketString
    // end if flags < 0
    // flag & 0x100
    private unk32: number
    private unk33: number
    // end of flag & 0x100
    // flag & 0x200
    private unk34: number
    private unk35: PacketString
    private unk36: number
    private unk37: number
    private unk38: number[] // array size is always 5
    private unk39: number[] // array size is always 5
    // end of flag & 0x200
    // flag & 0x400
    private unk40: number
    // end of flag & 0x400
    // flag & 0x800
    private unk41: number
    private unk42: number
    // end of flag & 0x800
    // flag & 0x1000
    private unk43: number
    private unk44: number
    private unk45: number
    // end of flag & 0x1000
    // flag & 0x2000
    private unk46: number
    private unk47: Uint64LE
    // end of flag & 0x2000
    // flag & 0x4000
    private unk48: number
    // end of flag & 0x4000
    // flag & 0x8000
    private unk49: number
    // end of flag & 0x8000
    // flag & 0x10000
    private unk50: number
    // end of flag & 0x10000
    // flag & 0x20000
    private unk51: number[] // should always be 0x80 bytes long
    // end of flag & 0x20000
    // flag & 0x40000
    private unk52: PacketString
    // end of flag & 0x40000
    // flag & 0x80000
    private unk53: number
    private unk54: number
    // end of flag & 0x80000
    // flag & 0x100000
    private unk55: number
    private unk56: number
    private unk57: number
    // end of flag & 0x100000
    // flag & 0x200000
    private unk58: number
    // end of flag & 0x200000
    // flag & 0x400000
    private unk59: number[] // it must always be 0x80 long
    private unk60: number
    // end of flag & 0x400000
    // flag & 0x800000
    private icon: number
    // end of flag & 0x800000
    // flag & 0x1000000
    private unk62: number
    // end of flag & 0x1000000
    // flag & 0x2000000
    private unk63: number[] // it must always be 0x80 long
    // end of flag & 0x2000000
    // flag & 0x4000000
    private vip: number
    private viplevel: number
    private vipexp: number
    // end of flag & 0x4000000
    // flag & 0x8000000
    private unk67: number
    // end of flag & 0x8000000
    // flag & 0x10000000
    private unk68: Uint64LE
    private unk69: Uint64LE
    private unk70: number
    private unk71: Uint64LE
    private unk72: Uint64LE
    private unk73: number
    private unk74: number
    private unk75: number
    private unk76: number
    private unk77: number
    private unk78: number
    private unk79: number
    // end of flag & 0x10000000
    // flag & 0x20000000
    private unk80: number
    private unk81: number
    // end of flag & 0x20000000
    // flag & 0x40000000
    private unk82: number
    private unk83: number
    private unk84: number
    // end of flag & 0x40000000

    constructor(user: User) {
        // this.userId = user.userId
        this.flags = 0xFFFFFFFF
        this.unk00 = new Uint64LE(0x2241158F)
        this.userName = new PacketString(user.userName)
        this.level = user.level
        this.curExp = user.curExp
        this.maxExp = user.maxExp
        this.unk03 = 0x0313
        this.rank = user.rank
        this.unk05 = 0
        this.unk06 = new Uint64LE(0x7AF3)
        this.unk07 = 0x0A
        this.wins = user.wins
        this.kills = user.kills
        this.unk10 = 0x50
        this.deaths = user.deaths
        this.assists = user.assists
        this.unk13 = 0x0A
        this.unk14 = 0x290C
        this.unk15 = 0
        this.unk16 = 0x32
        this.unk17 = 0
        this.unk18 = new Uint64LE(0)
        this.unk19 = 0
        this.unk20 = 0
        this.unk21 = 0
        this.unk22 = 0
        this.unk23 = 0
        this.unk24 = 0
        this.unk25 = 0
        this.unk26 = new PacketString(null)
        this.unk27 = 0
        this.unk28 = 0
        this.unk29 = 0
        this.unk30 = 0
        this.unk31 = new PacketString(null)
        this.unk32 = 0
        this.unk33 = 0
        this.unk34 = 0
        this.unk35 = new PacketString(null)
        this.unk36 = 0
        this.unk37 = 0
        this.unk38 = [0, 0, 0, 0, 0]
        this.unk39 = [0, 0, 0, 0, 0]
        this.unk40 = 0
        this.unk41 = 0
        this.unk42 = 0
        this.unk43 = 0
        this.unk44 = 0xFF
        this.unk45 = 0
        this.unk46 = 0
        this.unk47 = new Uint64LE(0)
        this.unk48 = 0
        this.unk49 = 0
        this.unk50 = 0
        this.unk51 = [0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
        this.unk52 = new PacketString(null)
        this.unk53 = 0
        this.unk54 = 0
        this.unk55 = 7
        this.unk56 = 5
        this.unk57 = 9
        this.unk58 = 0
        this.unk59 = [0x00, 0x00, 0x18, 0x08, 0x00, 0x00, 0x00, 0x00, 0x42, 0x02,
            0x18, 0xC0, 0x09, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0xC0, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0xC8, 0xB7, 0x08, 0x00, 0x00, 0x04, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
        this.unk60 = 0xA5C8
        this.icon = 1006
        this.unk62 = 0
        this.unk63 = [0x00, 0x00, 0x18, 0x08, 0x00, 0x00, 0x00, 0x00, 0x42, 0x02,
            0x18, 0xC0, 0x09, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0xC0, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0xC8, 0xB7, 0x08, 0x00, 0x00, 0x04, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x00, 0x00]
        this.vip = 1
        this.viplevel = user.viplevel
        this.vipexp = 180000
        this.unk67 = 0
        this.unk68 = new Uint64LE(0x02FB)
        this.unk69 = new Uint64LE(0x19AC)
        this.unk70 = 0
        this.unk71 = new Uint64LE(0)
        this.unk72 = new Uint64LE(0x16F6)
        this.unk73 = 0
        this.unk74 = 0
        this.unk75 = 0
        this.unk76 = 0
        this.unk77 = 0
        this.unk78 = 0
        this.unk79 = 0
        this.unk80 = 0
        this.unk81 = 0
        this.unk82 = 0
        this.unk83 = 0
        this.unk84 = 0
    }

    /**
     * builds the sub structure to a packet's stream buffer
     * @param outPacket the packet where the data will go
     */
    public build(outPacket: OutPacketBase): void {
        // outPacket.writeUInt32(this.userId)
        outPacket.writeUInt32(this.flags)

        outPacket.writeUInt64(this.unk00)

        outPacket.writeString(this.userName)

        outPacket.writeUInt16(this.level)

        outPacket.writeUInt64(this.curExp)
        outPacket.writeUInt64(this.maxExp)
        outPacket.writeUInt32(this.unk03)

        outPacket.writeUInt8(this.rank)
        outPacket.writeUInt8(this.unk05)

        outPacket.writeUInt64(this.unk06)

        outPacket.writeUInt32(this.unk07)
        outPacket.writeUInt32(this.wins)
        outPacket.writeUInt32(this.kills)
        outPacket.writeUInt32(this.unk10)
        outPacket.writeUInt32(this.deaths)
        outPacket.writeUInt32(this.assists)
        outPacket.writeUInt16(this.unk13)
        outPacket.writeUInt32(this.unk14)
        outPacket.writeUInt32(this.unk15)
        outPacket.writeUInt32(this.unk16)
        outPacket.writeUInt8(this.unk17)
        outPacket.writeUInt64(this.unk18)
        outPacket.writeUInt32(this.unk19)
        outPacket.writeUInt32(this.unk20)
        outPacket.writeUInt32(this.unk21)
        outPacket.writeUInt32(this.unk22)
        outPacket.writeUInt32(this.unk23)
        outPacket.writeUInt32(this.unk24)
        outPacket.writeUInt32(this.unk25)

        outPacket.writeString(this.unk26)
        outPacket.writeUInt32(this.unk27)
        outPacket.writeUInt32(this.unk28)
        outPacket.writeUInt32(this.unk29)
        outPacket.writeUInt32(this.unk30)
        outPacket.writeString(this.unk31)

        outPacket.writeUInt32(this.unk32)
        outPacket.writeUInt32(this.unk33)

        outPacket.writeUInt32(this.unk34)
        outPacket.writeString(this.unk35)
        outPacket.writeUInt32(this.unk36)
        outPacket.writeUInt8(this.unk37)
        for (const elem of this.unk38) {
            outPacket.writeUInt32(elem)
        }
        for (const elem of this.unk39) {
            outPacket.writeUInt32(elem)
        }

        outPacket.writeUInt8(this.unk40)

        outPacket.writeUInt32(this.unk41)
        outPacket.writeUInt32(this.unk42)

        outPacket.writeUInt8(this.unk43)
        outPacket.writeUInt16(this.unk44)
        outPacket.writeUInt32(this.unk45)

        outPacket.writeUInt32(this.unk46)
        outPacket.writeUInt64(this.unk47)

        outPacket.writeUInt32(this.unk48)

        outPacket.writeUInt16(this.unk49)

        outPacket.writeUInt16(this.unk50)

        for (const elem of this.unk51) {
            outPacket.writeUInt8(elem)
        }

        outPacket.writeString(this.unk52)

        outPacket.writeUInt8(this.unk53)
        outPacket.writeUInt8(this.unk54)

        outPacket.writeUInt32(this.unk55)
        outPacket.writeUInt32(this.unk56)
        outPacket.writeUInt32(this.unk57)

        outPacket.writeUInt16(this.unk58)

        for (const elem of this.unk59) {
            outPacket.writeUInt8(elem)
        }
        outPacket.writeUInt32(this.unk60)

        outPacket.writeUInt16(this.icon)

        outPacket.writeUInt16(this.unk62)

        for (const elem of this.unk63) {
            outPacket.writeUInt8(elem)
        }

        outPacket.writeUInt8(this.vip)
        outPacket.writeUInt8(this.viplevel)
        outPacket.writeUInt32(this.vipexp)

        outPacket.writeUInt32(this.unk67)

        outPacket.writeUInt64(this.unk68)
        outPacket.writeUInt64(this.unk69)
        outPacket.writeUInt8(this.unk70)
        outPacket.writeUInt64(this.unk71)
        outPacket.writeUInt64(this.unk72)
        outPacket.writeUInt8(this.unk73)
        outPacket.writeUInt32(this.unk74)
        outPacket.writeUInt32(this.unk75)
        outPacket.writeUInt32(this.unk76)
        outPacket.writeUInt32(this.unk77)
        outPacket.writeUInt32(this.unk78)
        outPacket.writeUInt32(this.unk79)

        outPacket.writeUInt32(this.unk80)
        outPacket.writeUInt32(this.unk81)

        outPacket.writeUInt8(this.unk82)
        outPacket.writeUInt8(this.unk83)
        outPacket.writeUInt8(this.unk84)
    }
}
