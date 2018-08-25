import { PacketId } from '../definitions'
import { PacketString } from '../packetstring'
import { OutgoingPacket } from './packet'

// this is not ready for use
export class OutgoingRoomPacket extends OutgoingPacket {
    private roomStatus: number
    private unk00: number
    private unk01: number
    private unk02: number
    private unk03: number
    private unk04: number
    private roomFlags: number
    private roomName: PacketString
    private unk05: number
    private unk06: number
    private unk07: number
    private unk08: number
    private unk09: PacketString
    private unk10: number
    private unk11: number
    private gameModeId: number
    private mapId: number
    private unk13: number
    private unk14: number
    private winLimit: number
    private killLimit: number
    private unk17: number
    private unk18: number
    private unk19: number
    private unk20: number
    private unk21: number
    private unk22: number
    private unk23: number
    private unk24: number
    private unk25: number
    private unk26: number
    private unk27: number
    private unk28: number
    private unk29: number
    private unk30: number
    private unk31: number
    private unk32: number
    private unk33: number
    private unk34: number
    private unk35: number
    private unk36: number
    private unk37: number
    private unk38: number
    private unk39: number
    private unk40: number
    private unk41: number
    private unk42: number
    private unk43: number
    private unk44: number
    private unk45: number
    private numOfPlayers: number
    private playerIds: number[] // is it playerIds?
    private playerUnk00: number[]
    private playerUnk01: number[]
    private playerUnk02: number[]
    private playerUnk03: number[]
    private playerUnk04: number[]
    private playerUnk05: number[]
    private playerUnk06: number[]
    private playerUnk07: number[]
    private playerUnk08: number[]
    private playerUnk09: number[]
    private playerUnk10: number[]
    private playerFlags: number[]
    private playerUnk11: number[]
    private playerUnk12: PacketString
    private playerLevel: number[]
    private playerUnk13: number[]
    private playerUnk14: number[]
    private playerUnk15: number[]
    private playerUnk16: number[]
    private playerUnk17: number[]
    private playerUnk18: number[]
    private playerUnk19: number[]
    private playerUnk20: number[]
    private playerUnk21: number[]
    private playerUnk22: number[]
    private playerUnk23: number[]
    private playerUnk24: number[]
    private playerUnk25: number[]
    private playerUnk26: number[]
    private playerUnk27: number[]
    private playerUnk28: number[]
    private playerUnk29: number[]
    private playerUnk30: number[]
    private playerUnk31: number[]
    private playerUnk32: number[]
    private playerUnk33: number[]
    private playerUnk34: number[]
    private playerUnk35: number[]
    private playerUnk36: number[]
    private playerUnk37: number[]

    constructor() {
        super()
        this.roomStatus = 0 // joinroom
        this.unk00 = 0x2005B8C
        this.unk01 = 2
        this.unk02 = 2
        this.unk03 = 0x219
        this.unk04 = 5
        this.roomFlags = 0xFFFFFFFFFFFF
        this.roomName = new PacketString('??!????????!')
        this.unk05 = 0
        this.unk06 = 0
        this.unk07 = 0
        this.unk08 = 0
        this.unk09 = new PacketString(null)
        this.unk10 = 0
        this.unk11 = 1
        this.gameModeId = 0x2F
        this.mapId = 3
        this.unk13 = 0
        this.unk14 = 1
        this.winLimit = 0xA
        this.killLimit = 0xA
        this.unk17 = 1
        this.unk18 = 0xA
        this.unk19 = 0
        this.unk20 = 0
        this.unk21 = 0
        this.unk22 = 0
        this.unk23 = 0
        this.unk24 = 0
        this.unk25 = 0x5A
        this.unk26 = 0
        this.unk27 = 1
        this.unk28 = 0
        this.unk29 = 0
        this.unk30 = 1
        this.unk31 = 1
        this.unk32 = 0
        this.unk33 = 0
        this.unk34 = 0
        this.unk35 = 0
        this.unk36 = 0
        this.unk37 = 0
        this.unk38 = 1
        this.unk39 = 0
        this.unk40 = 0x3E80
        this.unk41 = 0
        this.unk42 = 1
        this.unk43 = 0
        this.unk44 = 0
        this.unk45 = 3

        this.numOfPlayers = 1
        this.playerIds = [0x2005B8C]
        this.playerUnk00 = [2]
        this.playerUnk01 = [0]
        this.playerUnk02 = [0]
        this.playerUnk03 = [0x1FB153BC]
        this.playerUnk04 = [0xC2A2]
        this.playerUnk05 = [0xE87C]
        this.playerUnk06 = [0xD4F2]
        this.playerUnk07 = [0x138A8C0]
        this.playerUnk08 = [0x6987]
        this.playerUnk09 = [0x697D]
        this.playerUnk10 = [0x698C]
        this.playerFlags = [0xFFFFFFFF]
        this.playerUnk11 = [0x2241158F]
        this.playerUnk12 = new PacketString('GasTheJews')
        this.playerLevel = [6]
        this.playerUnk13 = [0x9453]
        this.playerUnk14 = [0xBD5F]
        this.playerUnk15 = [0x313]
        this.playerUnk16 = [0]
        this.playerUnk17 = [0]
    }

    public build(): Buffer {
        const packetLength = OutgoingPacket.headerLength() + // base packet
            1 + // is bad hash
            0// this.hash.length() // hash's length including size byte

        let curOffset = 0

        const newBuffer = Buffer.alloc(packetLength)

        // packet size excludes packet header
        this.buildHeader(newBuffer, packetLength)
        curOffset += OutgoingPacket.headerLength()

        newBuffer.writeUInt8(this.roomStatus, curOffset++)

        newBuffer.writeUInt32LE(this.unk00, curOffset)
        curOffset += 4

        newBuffer.writeUInt8(this.unk01, curOffset++)
        newBuffer.writeUInt8(this.unk02, curOffset++)

        newBuffer.writeUInt16LE(this.unk03, curOffset)
        curOffset += 2

        // special class start?
        newBuffer.writeUInt8(this.unk04, curOffset++)

        newBuffer.writeUIntLE(this.roomFlags, curOffset, 8)
        curOffset += 8

        this.roomName.toBuffer().copy(newBuffer, curOffset)
        curOffset += this.roomName.length() + 1

        newBuffer.writeUInt8(this.unk05, curOffset++)
        newBuffer.writeUInt8(this.unk06, curOffset++)

        newBuffer.writeUInt32LE(this.unk07, curOffset)
        curOffset += 4

        newBuffer.writeUInt32LE(this.unk08, curOffset)
        curOffset += 4

        this.unk09.toBuffer().copy(newBuffer, curOffset)
        curOffset += this.unk09.length() + 1

        newBuffer.writeUInt16LE(this.unk10, curOffset)
        curOffset += 2

        newBuffer.writeUInt8(this.unk11, curOffset++)

        newBuffer.writeUInt8(this.gameModeId, curOffset++)

        newBuffer.writeUInt8(this.mapId, curOffset++)

        newBuffer.writeUInt8(this.unk13, curOffset++)

        newBuffer.writeUInt8(this.unk14, curOffset++)

        newBuffer.writeUInt8(this.winLimit, curOffset++)

        newBuffer.writeUInt16LE(this.killLimit, curOffset)
        curOffset += 2

        newBuffer.writeUInt8(this.unk17, curOffset++)

        newBuffer.writeUInt8(this.unk18, curOffset++)

        newBuffer.writeUInt8(this.unk19, curOffset++)

        newBuffer.writeUInt8(this.unk20, curOffset++)

        newBuffer.writeUInt8(this.unk21, curOffset++)

        newBuffer.writeUInt8(this.unk22, curOffset++)

        newBuffer.writeUInt8(this.unk23, curOffset++)

        newBuffer.writeUInt8(this.unk24, curOffset++)

        newBuffer.writeUInt8(this.unk25, curOffset++)

        newBuffer.writeUInt8(this.unk26, curOffset++)

        newBuffer.writeUInt8(this.unk27, curOffset++)

        newBuffer.writeUInt8(this.unk28, curOffset++)

        newBuffer.writeUInt8(this.unk29, curOffset++)

        newBuffer.writeUInt8(this.unk30, curOffset++)

        newBuffer.writeUInt8(this.unk31, curOffset++)

        newBuffer.writeUInt8(this.unk32, curOffset++)

        newBuffer.writeUInt8(this.unk33, curOffset++)

        newBuffer.writeUInt8(this.unk34, curOffset++)

        newBuffer.writeUInt8(this.unk35, curOffset++)

        newBuffer.writeUInt8(this.unk36, curOffset++)

        newBuffer.writeUInt8(this.unk37, curOffset++)

        newBuffer.writeUInt8(this.unk38, curOffset++)

        newBuffer.writeUInt8(this.unk39, curOffset++)

        newBuffer.writeUInt16LE(this.unk40, curOffset)
        curOffset += 2

        newBuffer.writeUInt8(this.unk41, curOffset++)

        newBuffer.writeUInt8(this.unk42, curOffset++)

        newBuffer.writeUInt8(this.unk43, curOffset++)

        newBuffer.writeUInt8(this.unk44, curOffset++)

        newBuffer.writeUInt8(this.unk45, curOffset++)
        // special class end?

        // special class start?
        newBuffer.writeUInt8(this.numOfPlayers, curOffset++)

        let curPlayer = 0
        this.playerIds.forEach((element) => {
            newBuffer.writeUInt32LE(element, curOffset)
            curOffset += 4

            newBuffer.writeUInt8(this.playerUnk00[curPlayer], curOffset++)

            newBuffer.writeUInt8(this.playerUnk01[curPlayer], curOffset++)

            newBuffer.writeUInt8(this.playerUnk02[curPlayer], curOffset++)

            newBuffer.writeUInt32LE(this.playerUnk03[curPlayer], curOffset)
            curOffset += 4

            newBuffer.writeUInt16LE(this.playerUnk04[curPlayer], curOffset)
            curOffset += 2

            newBuffer.writeUInt16LE(this.playerUnk05[curPlayer], curOffset)
            curOffset += 2

            newBuffer.writeUInt16LE(this.playerUnk06[curPlayer], curOffset)
            curOffset += 2

            newBuffer.writeUInt32LE(this.playerUnk07[curPlayer], curOffset)
            curOffset += 4

            newBuffer.writeUInt16LE(this.playerUnk08[curPlayer], curOffset)
            curOffset += 2

            newBuffer.writeUInt16LE(this.playerUnk09[curPlayer], curOffset)
            curOffset += 2

            newBuffer.writeUInt16LE(this.playerUnk10[curPlayer], curOffset)
            curOffset += 2

            newBuffer.writeUInt32LE(this.playerFlags[curPlayer], curOffset)
            curOffset += 4

            newBuffer.writeUIntLE(this.playerUnk11[curPlayer], curOffset, 8)
            curOffset += 8

            this.playerUnk12.toBuffer().copy(newBuffer, curOffset)
            curOffset += this.playerUnk12.length() + 1

            newBuffer.writeUInt16LE(this.playerLevel[curPlayer], curOffset)
            curOffset += 2

            newBuffer.writeUIntLE(this.playerUnk13[curPlayer], curOffset, 8)
            curOffset += 8

            newBuffer.writeUIntLE(this.playerUnk14[curPlayer], curOffset, 8)
            curOffset += 8

            newBuffer.writeUInt32LE(this.playerUnk15[curPlayer], curOffset)
            curOffset += 4

            newBuffer.writeUInt8(this.playerUnk16[curPlayer], curOffset++)

            newBuffer.writeUInt8(this.playerUnk17[curPlayer], curOffset++)

            curPlayer++
        });
        // special class end?

        return newBuffer
    }
}
