import { Uint64LE } from 'int64-buffer'

import { OutPacketBase } from 'packets/out/packet'
import { PacketString } from 'packets/packetstring'

import { Room, RoomStatus } from 'room/room'

import { OutRoomPlayerNetInfo } from 'packets/out/room/playernetinfo'
import { UserInfoFullUpdate } from 'packets/out/userinfo/fulluserupdate'

/**
 * sends the newly created room information to an user
 */
export class OutRoomCreateAndJoin {
    public static async build(room: Room, outPacket: OutPacketBase): Promise<void> {
        outPacket.writeUInt32(room.host.userId) // roomHostId

        outPacket.writeUInt8(2) // unk01
        outPacket.writeUInt8(2) // unk02

        outPacket.writeUInt16(room.id) // roomId

        outPacket.writeUInt8(5) // unk04

        // special class start?
        // flags & 0x1
        outPacket.writeUInt64(new Uint64LE('FFFFFFFFFFFFFFFF', 16)) // roomFlags
        outPacket.writeString(new PacketString(room.settings.roomName)) // roomName
        // end of flags & 0x1
        // flags & 0x2
        outPacket.writeUInt8(0) // unk05
        // end of flags & 0x2
        // flags & 0x4
        outPacket.writeUInt8(0) // unk06
        outPacket.writeUInt32(0) // unk07
        outPacket.writeUInt32(0) // unk08
        // end of flags & 0x4
        // flags & 0x8
        outPacket.writeString(new PacketString(null)) // unk09
        // end of flags & 0x8
        // flags & 0x10
        outPacket.writeUInt16(0) // unk10
        // end of flags & 0x10
        // flags & 0x20
        outPacket.writeUInt8(1) // unk11
        // end of flags & 0x20
        // flags & 0x40
        outPacket.writeUInt8(room.settings.gameModeId) // gameModeId
        // end of flags & 0x40
        // flags & 0x80
        outPacket.writeUInt8(room.settings.mapId) // mapId
        outPacket.writeUInt8(0) // unk13
        // end of flags & 0x80
        // flags & 0x100
        outPacket.writeUInt8(1) // unk14
        // end of flags & 0x100
        // flags & 0x200
        outPacket.writeUInt8(room.settings.winLimit) // winLimit
        // end of flags & 0x200
        // flags & 0x400
        outPacket.writeUInt16(room.settings.killLimit) // killLimit
        // end of flags & 0x400
        // flags & 0x800
        outPacket.writeUInt8(1) // unk17
        // end of flags & 0x800
        // flags & 0x1000
        outPacket.writeUInt8(10) // unk18
        // end of flags & 0x1000
        // flags & 0x2000
        outPacket.writeUInt8(0) // unk19
        // end of flags & 0x2000
        // flags & 0x4000
        outPacket.writeUInt8(room.getStatus()) // status
        // end of flags & 0x4000
        // flags & 0x8000
        outPacket.writeUInt8(0) // unk21
        outPacket.writeUInt8(0) // unk22
        outPacket.writeUInt8(0) // unk23
        outPacket.writeUInt8(0) // unk24
        // end of flags & 0x8000
        // flags & 0x10000
        outPacket.writeUInt8(90) // unk25
        // end of flags & 0x10000
        // flags & 0x20000
        const unk27: number[] = [] // unk27
        outPacket.writeUInt8(unk27.length) // countOfUnk27
        for (const iterator of unk27) {
            outPacket.writeUInt8(iterator)
        }
        // end of flags & 0x20000
        // flags & 0x40000
        outPacket.writeUInt8(1) // unk28
        // end of flags & 0x40000
        // flags & 0x80000
        outPacket.writeUInt8(0) // unk29
        // end of flags & 0x80000
        // flags & 0x100000
        outPacket.writeUInt8(0) // unk30
        // end of flags & 0x100000
        // flags & 0x20000
        outPacket.writeUInt8(1) // unk31
        // end of flags & 0x200000
        // flags & 0x400000
        outPacket.writeUInt8(1) // unk32
        // end of flags & 0x400000
        // flags & 0x800000
        outPacket.writeUInt8(0) // unk33
        // end of flags & 0x800000
        // flags & 0x1000000
        // if == 1, it can have 3 more bytes
        outPacket.writeUInt8(room.settings.areBotsEnabled ? 1 : 0) // botEnabled
        if (room.settings.areBotsEnabled) {
            outPacket.writeUInt8(room.settings.botDifficulty) // botDifficulty
            outPacket.writeUInt8(room.settings.numCtBots) // numCtBots
            outPacket.writeUInt8(room.settings.numTrBots) // numTrBots
        }
        // end of flags & 0x1000000
        // flags & 0x2000000
        outPacket.writeUInt8(0) // unk35
        // end of flags & 0x2000000
        // flags & 0x4000000
        outPacket.writeUInt8(0) // unk36
        // end of flags & 0x4000000
        // flags & 0x8000000
        outPacket.writeUInt8(0) // unk37
        // end of flags & 0x8000000
        // flags & 0x10000000
        outPacket.writeUInt8(0) // unk38
        // end of flags & 0x10000000
        // flags & 0x20000000
        outPacket.writeUInt8(0) // unk39
        // end of flags & 0x20000000
        // flags & 0x40000000
        outPacket.writeUInt8(room.getStatus() === RoomStatus.Ingame ? 1 : 0) // isInGame
        // end of flags & 0x40000000
        // flags & 0x80000000
        outPacket.writeUInt16(16000) // unk41
        // end of flags & 0x80000000
        // flags & 0x100000000
        outPacket.writeUInt8(0) // unk42
        // end of flags & 0x100000000
        // flags & 0x200000000
        outPacket.writeUInt8(0) // unk43
        // end of flags & 0x200000000
        // flags & 0x400000000
        outPacket.writeUInt8(0) // unk44
        // end of flags & 0x400000000
        // flags & 0x800000000
        outPacket.writeUInt8(0) // mapLevel
        // end of flags & 0x800000000
        // flags & 0x1000000000
        outPacket.writeUInt8(3) // unk46
        // end of flags & 0x1000000000
        // special class end?

        outPacket.writeUInt8(room.usersInfo.length) // numOfPlayers

        for (const userEntry of room.usersInfo) {
            outPacket.writeUInt32(userEntry.userId)
            await OutRoomPlayerNetInfo.build(userEntry.userId, room.getUserTeam(userEntry.userId), outPacket)
            await UserInfoFullUpdate.build(userEntry.conn.getOwner(), outPacket)
        }
    }
}
