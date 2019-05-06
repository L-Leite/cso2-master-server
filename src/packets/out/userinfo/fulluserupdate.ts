import { Uint64LE } from 'int64-buffer'

import { OutPacketBase } from 'packets/out/packet'
import { PacketString } from 'packets/packetstring'

import { User } from 'user/user'

/**
 * sends out an user's data
 * @class UserInfoFullUpdate
 */
export class UserInfoFullUpdate {
    /**
     * builds the sub structure to a packet's stream buffer
     * @param outPacket the packet where the data will go
     */
    public static async build(userId: number, outPacket: OutPacketBase): Promise<void> {
        const user: User = await User.get(userId)

        if (user == null) {
            return
        }

        // outPacket.writeUInt32(this.userId)

        // should always be 0xFFFFFFFF for a full update
        outPacket.writeUInt32(0xFFFFFFFF) // flags

        // flag & 0x1
        outPacket.writeUInt64(new Uint64LE(0x2241158F)) // unk00, nexon id?
        // end flag & 0x1
        // flag & 0x2
        outPacket.writeString(new PacketString(user.playerName)) // userName
        // end of flag & 0x2
        // flag & 0x4
        outPacket.writeUInt16(user.level) // level
        // end of flag & 0x4
        // flag & 0x8
        outPacket.writeUInt64(new Uint64LE(user.curExp)) // curExp
        outPacket.writeUInt64(new Uint64LE(user.maxExp)) // maxExp
        outPacket.writeUInt32(0x313) // unk03
        // end of flag & 0x8
        // flag & 0x10
        outPacket.writeUInt8(user.rank) // rank
        outPacket.writeUInt8(0) // unk05
        // end of flag & 0x10
        // flag & 0x20
        outPacket.writeUInt64(new Uint64LE(0x7AF3)) // unk06
        // end of flag & 0x20
        // flag & 0x40
        outPacket.writeUInt32(10) // unk07
        outPacket.writeUInt32(user.wins) // wins
        outPacket.writeUInt32(user.kills) // kills
        outPacket.writeUInt32(80) // unk10
        outPacket.writeUInt32(user.deaths) // deaths
        outPacket.writeUInt32(user.assists) // assists
        outPacket.writeUInt16(10) // unk13
        outPacket.writeUInt32(0x290C) // unk14
        outPacket.writeUInt32(0) // unk15
        outPacket.writeUInt32(50) // unk16
        outPacket.writeUInt8(0) // unk17
        outPacket.writeUInt64(new Uint64LE(0)) // unk18
        outPacket.writeUInt32(0) // unk19
        outPacket.writeUInt32(0) // unk20
        outPacket.writeUInt32(0) // unk21
        outPacket.writeUInt32(0) // unk22
        outPacket.writeUInt32(0) // unk23
        outPacket.writeUInt32(0) // unk24
        outPacket.writeUInt32(0) // unk25
        // end of flag & 0x40
        // if flags & 0x80
        outPacket.writeString(new PacketString(null)) // unk26
        outPacket.writeUInt32(0) // unk27
        outPacket.writeUInt32(0) // unk28
        outPacket.writeUInt32(0) // unk29
        outPacket.writeUInt32(0) // unk30
        outPacket.writeString(new PacketString(null)) // unk31
        // end if flags & 0x80
        // flag & 0x100
        outPacket.writeUInt32(0) // unk32
        outPacket.writeUInt32(0) // unk33
        // end of flag & 0x100
        // flag & 0x200
        outPacket.writeUInt32(0) // unk34
        outPacket.writeString(new PacketString(null)) // unk35
        outPacket.writeUInt32(0) // unk36
        outPacket.writeUInt8(0) // unk37
         // array size is always 5
        for (const elem of [0, 0, 0, 0, 0]) {
            outPacket.writeUInt32(elem)  // unk38
        }
         // array size is always 5
        for (const elem of [0, 0, 0, 0, 0]) {
            outPacket.writeUInt32(elem) // unk39
        }
        // end of flag & 0x200
        // flag & 0x400
        outPacket.writeUInt8(0) // unk40
        // end of flag & 0x400
        // flag & 0x800
        outPacket.writeUInt32(0) // unk41
        outPacket.writeUInt32(0) // unk42
        // end of flag & 0x400
        // flag & 0x800
        outPacket.writeUInt8(0) // unk43
        outPacket.writeUInt16(255) // unk44
        outPacket.writeUInt32(0) // unk45
        // end of flag & 0x1000
        // flag & 0x2000
        outPacket.writeUInt32(0) // unk46
        outPacket.writeUInt64(new Uint64LE(0)) // unk47
        // end of flag & 0x2000
        // flag & 0x4000
        outPacket.writeUInt32(0) // unk48
        // end of flag & 0x4000
        // flag & 0x8000
        outPacket.writeUInt16(0) // unk49
         // end of flag & 0x8000
        // flag & 0x10000
        outPacket.writeUInt16(0) // unk50
        // end of flag & 0x10000
        // flag & 0x20000
        // should always be 128 bytes long
        for (const elem of [0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]) {
            outPacket.writeUInt8(elem) // unk51
        }
        // end of flag & 0x20000
        // flag & 0x40000
        outPacket.writeString(new PacketString(null)) // unk52
        // end of flag & 0x40000
        // flag & 0x80000
        outPacket.writeUInt8(0) // unk53
        outPacket.writeUInt8(0) // unk54
        // end of flag & 0x80000
        // flag & 0x100000
        outPacket.writeUInt32(7) // unk55
        outPacket.writeUInt32(5) // unk56
        outPacket.writeUInt32(9) // unk57
        // end of flag & 0x100000
        // flag & 0x200000
        outPacket.writeUInt16(0) // unk58
        // end of flag & 0x200000
        // flag & 0x400000
        // it must always be 128 bytes long
        for (const elem of [0x00, 0x00, 0x18, 0x08, 0x00, 0x00, 0x00, 0x00, 0x42, 0x02,
            0x18, 0xC0, 0x09, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0xC0, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0xC8, 0xB7, 0x08, 0x00, 0x00, 0x04, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]) {
            outPacket.writeUInt8(elem) // unk59
        }
        outPacket.writeUInt32(0xA5C8) // unk60
        // end of flag & 0x400000
        // flag & 0x800000
        outPacket.writeUInt16(user.avatar)
        // end of flag & 0x800000
        // flag & 0x1000000

        outPacket.writeUInt16(0) // unk62
        // end of flag & 0x1000000
        // flag & 0x2000000
        // it must always be 128 bytes long
        for (const elem of [0x00, 0x00, 0x18, 0x08, 0x00, 0x00, 0x00, 0x00, 0x42, 0x02,
            0x18, 0xC0, 0x09, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0xC0, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0xC8, 0xB7, 0x08, 0x00, 0x00, 0x04, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x00, 0x00]) {
            outPacket.writeUInt8(elem) // unk63
        }
        // end of flag & 0x2000000
        // flag & 0x4000000
        outPacket.writeUInt8(user.isVip() ? 1 : 0) // isVip
        outPacket.writeUInt8(user.vipLevel) // vipLevel
        outPacket.writeUInt32(180000) // vipExp
        // end of flag & 0x4000000
        // flag & 0x8000000
        outPacket.writeUInt32(0) // unk67
        // end of flag & 0x8000000
        // flag & 0x10000000
        outPacket.writeUInt64(new Uint64LE(0x2FB)) // unk68
        outPacket.writeUInt64(new Uint64LE(0x19AC)) // unk69
        outPacket.writeUInt8(0) // unk70
        outPacket.writeUInt64(new Uint64LE(0)) // unk71
        outPacket.writeUInt64(new Uint64LE(0x16F6)) // unk72
        outPacket.writeUInt8(0) // unk73
        outPacket.writeUInt32(0) // unk74
        outPacket.writeUInt32(0) // unk75
        outPacket.writeUInt32(0) // unk76
        outPacket.writeUInt32(0) // unk77
        outPacket.writeUInt32(0) // unk78
        outPacket.writeUInt32(0) // unk79
        // end of flag & 0x10000000
        // flag & 0x20000000
        outPacket.writeUInt32(0) // unk80
        outPacket.writeUInt32(0) // unk81
        // end of flag & 0x20000000
        // flag & 0x40000000
        outPacket.writeUInt8(0) // unk82
        outPacket.writeUInt8(0) // unk83
        outPacket.writeUInt8(0) // unk84
        // end of flag & 0x40000000
    }
}
