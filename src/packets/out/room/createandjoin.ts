import { Uint64LE } from 'int64-buffer'

import { OutPacketBase } from 'packets/out/packet'
import { PacketString } from 'packets/packetstring'

import { Room, RoomTeamNum } from 'room/room'
import { User } from 'user/user'

import { OutRoomPlayerNetInfo } from 'packets/out/room/playernetinfo'
import { UserInfoFullUpdate } from 'packets/out/userinfo/fulluserupdate'

/**
 * Sub structure of Room packet
 * Stores information used to create a new room
 * @class OutRoomCreateAndJoin
 */
export class OutRoomCreateAndJoin {
    private room: Room
    private roomHostId: number
    private unk01: number
    private unk02: number
    private roomId: number
    private unk04: number
    private roomFlags: Uint64LE
    // flags & 0x1
    private roomName: PacketString
    // end of flags & 0x1
    // flags & 0x2
    private unk05: number
    // end of flags & 0x2
    // flags & 0x4
    private unk06: number
    private unk07: number
    private unk08: number
    // end of flags & 0x4
    // flags & 0x8
    private unk09: PacketString
    // end of flags & 0x8
    // flags & 0x10
    private unk10: number
    // end of flags & 0x10
    // flags & 0x20
    private unk11: number
    // end of flags & 0x20
    // flags & 0x40
    private gameModeId: number
    // end of flags & 0x40
    // flags & 0x80
    private mapId: number
    private unk13: number
    // end of flags & 0x80
    // flags & 0x100
    private unk14: number
    // end of flags & 0x100
    // flags & 0x200
    private winLimit: number
    // end of flags & 0x200
    // flags & 0x400
    private killLimit: number
    // end of flags & 0x400
    // flags & 0x800
    private unk17: number
    // end of flags & 0x800
    // flags & 0x1000
    private unk18: number
    // end of flags & 0x1000
    // flags & 0x2000
    private unk19: number
    // end of flags & 0x2000
    // flags & 0x4000
    private unk20: number
    // end of flags & 0x4000
    // flags & 0x8000
    private unk21: number
    private unk22: number
    private unk23: number
    private unk24: number
    // end of flags & 0x8000
    // flags & 0x10000
    private unk25: number
    // end of flags & 0x10000
    // flags & 0x20000
    private unk26: number
    private unk27: number[]
    // end of flags & 0x20000
    // flags & 0x40000
    private unk28: number
    // end of flags & 0x40000
    // flags & 0x80000
    private unk29: number
    // end of flags & 0x80000
    // flags & 0x100000
    private unk30: number
    // end of flags & 0x100000
    // flags & 0x20000
    private unk31: number
    // end of flags & 0x200000
    // flags & 0x400000
    private unk32: number
    // end of flags & 0x400000
    // flags & 0x800000
    private unk33: number
    // end of flags & 0x800000
    // flags & 0x1000000
    private botEnabled: number // if == 1, it can have 3 more bytes
    private botDifficulty: number
    private numCtBots: number
    private numTrBots: number
    // end of flags & 0x1000000
    // flags & 0x2000000
    private unk35: number
    // end of flags & 0x2000000
    // flags & 0x4000000
    private unk36: number
    // end of flags & 0x4000000
    // flags & 0x8000000
    private unk37: number
    // end of flags & 0x8000000
    // flags & 0x10000000
    private unk38: number
    // end of flags & 0x10000000
    // flags & 0x20000000
    private unk39: number
    // end of flags & 0x20000000
    // flags & 0x40000000
    private unk40: number
    // end of flags & 0x40000000
    // flags & 0x80000000
    private unk41: number
    // end of flags & 0x80000000
    // flags & 0x100000000
    private unk42: number
    // end of flags & 0x100000000
    // flags & 0x200000000
    private unk43: number
    // end of flags & 0x200000000
    // flags & 0x400000000
    private unk44: number
    // end of flags & 0x400000000
    // flags & 0x800000000
    private unk45: number
    // end of flags & 0x800000000
    // flags & 0x1000000000
    private unk46: number
    // end of flags & 0x1000000000
    private numOfPlayers: number
    private users: User[]

    constructor(roomInfo: Room) {
        this.room = roomInfo

        this.roomHostId = roomInfo.host.userId
        this.unk01 = 2
        this.unk02 = 2
        this.roomId = roomInfo.id
        this.unk04 = 5
        this.roomFlags = new Uint64LE('FFFFFFFFFFFFFFFF', 16)
        this.roomName = new PacketString(roomInfo.settings.roomName)
        this.unk05 = 0
        this.unk06 = 0
        this.unk07 = 0
        this.unk08 = 0
        this.unk09 = new PacketString('')
        this.unk10 = 0
        this.unk11 = 1
        this.gameModeId = roomInfo.settings.gameModeId
        this.mapId = roomInfo.settings.mapId
        this.unk13 = 0
        this.unk14 = 1
        this.winLimit = roomInfo.settings.winLimit
        this.killLimit = roomInfo.settings.killLimit
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
        this.unk27 = []
        /*for (let i = 0; i < this.unk26; i++) {
            add to this.unk27
        }*/
        this.unk28 = 1
        this.unk29 = 0
        this.unk30 = 0
        this.unk31 = 1
        this.unk32 = 1
        this.unk33 = 0
        this.botEnabled = 0

        if (this.botEnabled) {
            this.botDifficulty = 0
            this.numCtBots = 0
            this.numTrBots = 0
        }

        this.unk35 = 0
        this.unk36 = 0
        this.unk37 = 0
        this.unk38 = 0
        this.unk39 = 1
        this.unk40 = 0
        this.unk41 = 0x3E80
        this.unk42 = 0
        this.unk43 = 0
        this.unk44 = 0
        this.unk45 = 0
        this.unk46 = 3

        this.numOfPlayers = roomInfo.users.length
        this.users = roomInfo.users
    }
    public build(outPacket: OutPacketBase): void {

        outPacket.writeUInt32(this.roomHostId)

        outPacket.writeUInt8(this.unk01)
        outPacket.writeUInt8(this.unk02)

        outPacket.writeUInt16(this.roomId)

        outPacket.writeUInt8(this.unk04)

        // special class start?
        outPacket.writeUInt64(this.roomFlags)
        outPacket.writeString(this.roomName)

        outPacket.writeUInt8(this.unk05)

        outPacket.writeUInt8(this.unk06)
        outPacket.writeUInt32(this.unk07)
        outPacket.writeUInt32(this.unk08)

        outPacket.writeString(this.unk09)

        outPacket.writeUInt16(this.unk10)

        outPacket.writeUInt8(this.unk11)

        outPacket.writeUInt8(this.gameModeId)

        outPacket.writeUInt8(this.mapId)
        outPacket.writeUInt8(this.unk13)

        outPacket.writeUInt8(this.unk14)

        outPacket.writeUInt8(this.winLimit)

        outPacket.writeUInt16(this.killLimit)

        outPacket.writeUInt8(this.unk17)

        outPacket.writeUInt8(this.unk18)

        outPacket.writeUInt8(this.unk19)

        outPacket.writeUInt8(this.unk20)

        outPacket.writeUInt8(this.unk21)
        outPacket.writeUInt8(this.unk22)
        outPacket.writeUInt8(this.unk23)
        outPacket.writeUInt8(this.unk24)

        outPacket.writeUInt8(this.unk25)

        outPacket.writeUInt8(this.unk26)
        for (const iterator of this.unk27) {
            outPacket.writeUInt8(iterator)
        }

        outPacket.writeUInt8(this.unk28)

        outPacket.writeUInt8(this.unk29)

        outPacket.writeUInt8(this.unk30)

        outPacket.writeUInt8(this.unk31)

        outPacket.writeUInt8(this.unk32)

        outPacket.writeUInt8(this.unk33)

        // if == 1, it can have 3 more bytes
        outPacket.writeUInt8(this.botEnabled)

        if (this.botEnabled) {
            outPacket.writeUInt8(this.botDifficulty)
            outPacket.writeUInt8(this.numCtBots)
            outPacket.writeUInt8(this.numTrBots)
        }

        outPacket.writeUInt8(this.unk35)

        outPacket.writeUInt8(this.unk36)

        outPacket.writeUInt8(this.unk37)

        outPacket.writeUInt8(this.unk38)

        outPacket.writeUInt8(this.unk39)

        outPacket.writeUInt8(this.unk40)

        outPacket.writeUInt16(this.unk41)

        outPacket.writeUInt8(this.unk42)

        outPacket.writeUInt8(this.unk43)

        outPacket.writeUInt8(this.unk44)

        outPacket.writeUInt8(this.unk45)

        outPacket.writeUInt8(this.unk46)
        // special class end?

        outPacket.writeUInt8(this.numOfPlayers)

        for (const user of this.users) {
            outPacket.writeUInt32(user.userId)
            new OutRoomPlayerNetInfo(user, this.room.getUserTeam(user)).build(outPacket)
            new UserInfoFullUpdate(user).build(outPacket)
        }
    }
}
