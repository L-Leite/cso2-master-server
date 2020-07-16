import { Uint64LE } from 'int64-buffer'

import { Room } from 'room/room'
import { User } from 'user/user'

import { OutPacketBase } from 'packets/out/packet'

/**
 * shared room structure, used by room list
 */
export class RoomListItem {
    private room: Room

    constructor(room: Room) {
        this.room = room
    }

    public build(outPacket: OutPacketBase): void {
        const host: User = this.room.host.conn.session.user

        if (host == null) {
            return
        }

        outPacket.writeUInt16(this.room.id) // roomId
        outPacket.writeUInt64(new Uint64LE('FFFFFFFFFFFFFFFF', 16)) // flags

        // flags & 0x1
        outPacket.writeString(this.room.settings.roomName) // roomName
        // end flags & 0x1
        // flags & 0x2
        outPacket.writeUInt8(this.room.id) // roomNumber
        // end flags & 0x2
        // flags & 0x4
        outPacket.writeUInt8(this.room.IsPasswordProtected() === true ? 1 : 0) // passwordProtected
        // end flags & 0x4
        // flags & 0x8
        outPacket.writeUInt16(0) // unk03
        // end flags & 0x8
        // flags & 0x10
        outPacket.writeUInt8(this.room.settings.gameModeId) // gameModeId
        // end flags & 0x10
        // flags & 0x20
        outPacket.writeUInt8(this.room.settings.mapId) // mapId
        // end flags & 0x20
        // flags & 0x40
        outPacket.writeUInt8(this.room.usersInfo.length) // numPlayers
        // end flags & 0x40
        // flags & 0x80
        outPacket.writeUInt8(this.room.settings.maxPlayers) // maxPlayers
        // end flags & 0x80
        // flags & 0x100
        outPacket.writeUInt8(0) // unk08
        // end flags & 0x100
        // flags & 0x200
        outPacket.writeUInt32(host.id) // hostUserId
        outPacket.writeString(host.playername) // hostUserName
        outPacket.writeUInt8(0) // unk11
        // end flags & 0x200
        // flags & 0x400
        outPacket.writeUInt8(0) // unk12
        // end flags & 0x400
        // flags & 0x800
        // maybe some ip? it looks like 61.164.61.215
        outPacket.writeUInt32(0xd73da43d) // unk13
        // would this be some port? 40753 in decimal
        outPacket.writeUInt16(0x9f31) // unk14
        outPacket.writeUInt16(0xb2b9) // unk15
        outPacket.writeUInt32(0xd73da43d) // unk16
        outPacket.writeUInt16(0x9f31) // unk17
        outPacket.writeUInt16(0xb2b9) // unk18
        outPacket.writeUInt8(5) // unk19
        // end flags & 0x800
        // flags & 0x1000
        const unk20 = 0 // unk20
        outPacket.writeUInt8(unk20)
        /* if (unk20 === 1) {
            // unknown values in here
            outPacket.writeUInt32(0) // unk2001
            outPacket.writeUInt8(0) // unk2002
            outPacket.writeUInt32(0) // unk2003
            outPacket.writeUInt8(0) // unk2004
        } */
        // end flags & 0x1000
        // flags & 0x2000
        outPacket.writeUInt8(5) // unk21
        // end flags & 0x2000
        // flags & 0x4000
        outPacket.writeUInt8(this.room.settings.status) // roomStatus
        // end flags & 0x4000
        // flags & 0x8000
        outPacket.writeUInt8(this.room.settings.areBotsEnabled ? 1 : 0) // areBotsEnabled
        // end flags & 0x8000
        // flags & 0x10000
        outPacket.writeUInt8(0) // unk24
        // end flags & 0x10000
        // flags & 0x20000
        outPacket.writeUInt16(this.room.settings.startMoney) // startMoney
        // end flags & 0x20000
        // flags & 0x40000
        outPacket.writeUInt8(0) // unk26
        // end flags & 0x40000
        // flags & 0x80000
        outPacket.writeUInt8(0) // unk27
        // end flags & 0x80000
        // flags & 0x100000
        outPacket.writeUInt8(0) // unk28
        // end flags & 0x100000
        // flags & 0x200000
        outPacket.writeUInt8(1) // unk29
        // end flags & 0x200000
        // flags & 0x400000
        outPacket.writeUInt64(new Uint64LE(0x5af6f7bf)) // unk30
        // end flags & 0x400000
        // flags & 0x800000
        outPacket.writeUInt8(this.room.settings.winLimit) // winLimit
        outPacket.writeUInt16(this.room.settings.killLimit) // killLimit
        outPacket.writeUInt8(this.room.settings.forceCamera) // forceCamera
        // end flags & 0x800000
        // flags & 0x1000000
        outPacket.writeUInt8(4) // unk31
        // end flags & 0x1000000
        // flags & 0x2000000
        outPacket.writeUInt8(0) // unk35
        // end flags & 0x2000000
        // flags & 0x4000000
        outPacket.writeUInt8(this.room.settings.nextMapEnabled) // nextMapEnabled
        // end flags & 0x4000000
        // flags & 0x8000000
        outPacket.writeUInt8(this.room.settings.changeTeams) // changeTeams
        // end flags & 0x8000000
        // flags & 0x10000000
        outPacket.writeUInt8(0) // areFlashesDisabled
        // end flags & 0x10000000
        // flags & 0x20000000
        outPacket.writeUInt8(0) // canSpec
        // end flags & 0x20000000
        // flags & 0x40000000
        outPacket.writeUInt8(host.vip_level !== 0 ? 1 : 0) // isVipRoom
        outPacket.writeUInt8(host.vip_level) // vipRoomLevel
        // end flags & 0x40000000
        // flags & 0x80000000
        outPacket.writeUInt8(this.room.settings.difficulty) // difficulty
        // end flags & 0x80000000
    }
}
