import { Uint64LE } from 'int64-buffer';
import { WritableStreamBuffer } from 'stream-buffers';
import { ValToBuffer } from '../../util';
import { PacketId } from '../definitions'
import { PacketString } from '../packetstring'
import { OutgoingPacket } from './packet'

export class OutgoingUserInfoPacket extends OutgoingPacket {
    private userId: number
    private flags: number
    // flag & 0x1
    private unk00: Uint64LE // nexon id? printed
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
    private unk04: number
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
    private unk61: number
    // end of flag & 0x800000
    // flag & 0x1000000
    private unk62: number
    // end of flag & 0x1000000
    // flag & 0x2000000
    private unk63: number[] // it must always be 0x80 long
    // end of flag & 0x2000000
    // flag & 0x4000000
    private unk64: number
    private unk65: number
    private unk66: number
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
    constructor(userId: number, userName: string, level: number,
                curExp: Uint64LE, maxExp: Uint64LE,
                wins: number, kills: number,
                deaths: number, assists: number,
                seq: number) {
        super()
        this.sequence = seq
        this.id = PacketId.UserInfo

        this.userId = userId
        this.flags = 0xFFFFFFFF
        this.unk00 = new Uint64LE(0x2241158F)
        this.userName = new PacketString(userName)
        this.level = level
        this.curExp = new Uint64LE(0x9453)
        this.maxExp = new Uint64LE(0xBD5F)
        this.unk03 = 0x0313
        this.unk04 = 0
        this.unk05 = 0
        this.unk06 = new Uint64LE(0x7AF3)
        this.unk07 = 0x0A
        this.wins = 0x04
        this.kills = 159
        this.unk10 = 0x50
        this.deaths = 176
        this.assists = 120
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
        this.unk61 = 0x03ED
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
        this.unk64 = 0
        this.unk65 = 0
        this.unk66 = 0
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

    public buildData(outStream: WritableStreamBuffer): void {
        outStream.write(ValToBuffer(this.userId, 4))

        outStream.write(ValToBuffer(this.flags, 4))

        outStream.write(ValToBuffer(this.unk00, 8))

        outStream.write(this.userName.toBuffer())

        outStream.write(ValToBuffer(this.level, 2))

        outStream.write(ValToBuffer(this.curExp, 8))
        outStream.write(ValToBuffer(this.maxExp, 8))
        outStream.write(ValToBuffer(this.unk03, 4))

        outStream.write(ValToBuffer(this.unk04, 1))
        outStream.write(ValToBuffer(this.unk05, 1))

        outStream.write(ValToBuffer(this.unk06, 8))

        outStream.write(ValToBuffer(this.unk07, 4))
        outStream.write(ValToBuffer(this.wins, 4))
        outStream.write(ValToBuffer(this.kills, 4))
        outStream.write(ValToBuffer(this.unk10, 4))
        outStream.write(ValToBuffer(this.deaths, 4))
        outStream.write(ValToBuffer(this.assists, 4))
        outStream.write(ValToBuffer(this.unk13, 2))
        outStream.write(ValToBuffer(this.unk14, 4))
        outStream.write(ValToBuffer(this.unk15, 4))
        outStream.write(ValToBuffer(this.unk16, 4))
        outStream.write(ValToBuffer(this.unk17, 1))
        outStream.write(ValToBuffer(this.unk18, 8))
        outStream.write(ValToBuffer(this.unk19, 4))
        outStream.write(ValToBuffer(this.unk20, 4))
        outStream.write(ValToBuffer(this.unk21, 4))
        outStream.write(ValToBuffer(this.unk22, 4))
        outStream.write(ValToBuffer(this.unk23, 4))
        outStream.write(ValToBuffer(this.unk24, 4))
        outStream.write(ValToBuffer(this.unk25, 4))

        outStream.write(this.unk26.toBuffer())
        outStream.write(ValToBuffer(this.unk27, 4))
        outStream.write(ValToBuffer(this.unk28, 4))
        outStream.write(ValToBuffer(this.unk29, 4))
        outStream.write(ValToBuffer(this.unk30, 4))
        outStream.write(this.unk31.toBuffer())

        outStream.write(ValToBuffer(this.unk32, 4))
        outStream.write(ValToBuffer(this.unk33, 4))

        outStream.write(ValToBuffer(this.unk34, 4))
        outStream.write(this.unk35.toBuffer())
        outStream.write(ValToBuffer(this.unk36, 4))
        outStream.write(ValToBuffer(this.unk37, 1))
        for (const elem of this.unk38) {
            outStream.write(ValToBuffer(elem, 4))
        }
        for (const elem of this.unk39) {
            outStream.write(ValToBuffer(elem, 4))
        }

        outStream.write(ValToBuffer(this.unk40, 1))

        outStream.write(ValToBuffer(this.unk41, 4))
        outStream.write(ValToBuffer(this.unk42, 4))

        outStream.write(ValToBuffer(this.unk43, 1))
        outStream.write(ValToBuffer(this.unk44, 2))
        outStream.write(ValToBuffer(this.unk45, 4))

        outStream.write(ValToBuffer(this.unk46, 4))
        outStream.write(ValToBuffer(this.unk47, 8))

        outStream.write(ValToBuffer(this.unk48, 4))

        outStream.write(ValToBuffer(this.unk49, 2))

        outStream.write(ValToBuffer(this.unk50, 2))

        for (const elem of this.unk51) {
            outStream.write(ValToBuffer(elem, 1))
        }

        outStream.write(this.unk52.toBuffer())

        outStream.write(ValToBuffer(this.unk53, 1))
        outStream.write(ValToBuffer(this.unk54, 1))

        outStream.write(ValToBuffer(this.unk55, 4))
        outStream.write(ValToBuffer(this.unk56, 4))
        outStream.write(ValToBuffer(this.unk57, 4))

        outStream.write(ValToBuffer(this.unk58, 4))

        for (const elem of this.unk59) {
            outStream.write(ValToBuffer(elem, 1))
        }
        outStream.write(ValToBuffer(this.unk60, 4))

        outStream.write(ValToBuffer(this.unk61, 2))

        outStream.write(ValToBuffer(this.unk62, 2))

        for (const elem of this.unk63) {
            outStream.write(ValToBuffer(elem, 1))
        }

        outStream.write(ValToBuffer(this.unk64, 1))
        outStream.write(ValToBuffer(this.unk65, 1))
        outStream.write(ValToBuffer(this.unk66, 4))

        outStream.write(ValToBuffer(this.unk67, 4))

        outStream.write(ValToBuffer(this.unk68, 8))
        outStream.write(ValToBuffer(this.unk69, 8))
        outStream.write(ValToBuffer(this.unk70, 1))
        outStream.write(ValToBuffer(this.unk71, 8))
        outStream.write(ValToBuffer(this.unk72, 8))
        outStream.write(ValToBuffer(this.unk73, 1))
        outStream.write(ValToBuffer(this.unk74, 4))
        outStream.write(ValToBuffer(this.unk75, 4))
        outStream.write(ValToBuffer(this.unk76, 4))
        outStream.write(ValToBuffer(this.unk77, 4))
        outStream.write(ValToBuffer(this.unk78, 4))
        outStream.write(ValToBuffer(this.unk79, 4))

        outStream.write(ValToBuffer(this.unk80, 4))
        outStream.write(ValToBuffer(this.unk81, 4))

        outStream.write(ValToBuffer(this.unk82, 1))
        outStream.write(ValToBuffer(this.unk83, 1))
        outStream.write(ValToBuffer(this.unk84, 1))
    }

    public build(): Buffer {
        const outStream: WritableStreamBuffer = new WritableStreamBuffer(
            { initialSize: 100, incrementAmount: 20 })

        // packet size excludes packet header
        this.buildHeader2(outStream)

        // packet id
        outStream.write(ValToBuffer(this.id, 1))

        this.buildData(outStream)

        const resBuffer: Buffer = outStream.getContents()
        this.setPacketLength(resBuffer)

        return resBuffer
    }
}
