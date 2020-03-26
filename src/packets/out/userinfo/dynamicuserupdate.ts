import { Uint64LE } from 'int64-buffer'

import { OutPacketBase } from 'packets/out/packet'
import { PacketString } from 'packets/packetstring'

import { User } from 'user/user'

/**
 * sends only an user's changed data
 */
export class UserInfoDynamicUpdate {
    /**
     * builds the sub structure to a packet's stream buffer
     * @param outPacket the packet where the data will go
     */
    public static build(user: any, outPacket: OutPacketBase): void {
        // outPacket.writeUInt32(this.userId)

        outPacket.writeUInt32(this.GetFlagsUsed(user)) // flags

        // flag & 0x1
        // outPacket.writeUInt64(new Uint64LE(0x2241158F)) // unk00, nexon id?
        // end flag & 0x1

        if (user.playerName != null) {
            outPacket.writeString(new PacketString(user.playerName)) // userName
        }

        if (user.level != null) {
            outPacket.writeUInt16(user.level) // level
        }

        if (user.curExp != null || user.maxExp != null) {
            outPacket.writeUInt64(new Uint64LE(user.curExp)) // curExp
            outPacket.writeUInt64(new Uint64LE(user.maxExp)) // maxExp
            outPacket.writeUInt32(0x313) // unk03
        }

        if (user.rank != null || user.rankFrame != null) {
            outPacket.writeUInt8(user.rank) // rank
            outPacket.writeUInt8(user.rankFrame) // rankframe(item id: 9000-9003)
        }

        if (user.points != null) {
            outPacket.writeUInt64(new Uint64LE(user.points)) // Points
        }

        if (user.playedMatches != null || user.wins != null || user.kills != null
            || user.headshots != null || user.deaths != null || user.assists != null
            || user.accuracy != null || user.secondsPlayed != null) {
            outPacket.writeUInt32(user.playedMatches) // played game
            outPacket.writeUInt32(user.wins) // wins (win rate = wins / player game)
            outPacket.writeUInt32(user.kills) // kills
            outPacket.writeUInt32(user.headshots) // headshots (hs rate = hs / kills)
            outPacket.writeUInt32(user.deaths) // deaths
            outPacket.writeUInt32(user.assists) // assists
            outPacket.writeUInt16(user.accuracy) // hit rate
            outPacket.writeUInt32(user.secondsPlayed) // played time (s)
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
        }

        if (user.netCafeName != null) {
            outPacket.writeString(new PacketString(null)) // unk26
            outPacket.writeUInt32(0) // unk27
            outPacket.writeUInt32(0) // unk28
            outPacket.writeUInt32(0) // unk29
            outPacket.writeUInt32(0) // unk30
            outPacket.writeString(new PacketString(user.netCafeName)) // net cafe
        }

        if (user.cash != null) {
            outPacket.writeUInt32(user.cash) // Cash
            outPacket.writeUInt32(0) // unk33
        }

        if (user.clanName != null || user.clanMark != null) {
            outPacket.writeUInt32(0) // unk34
            outPacket.writeString(new PacketString(user.clanName)) // clan name
            outPacket.writeUInt32(user.clanMark) // clan mark (0-10)
            outPacket.writeUInt8(0) // unk37
            // array size is always 5
            for (const elem of [0, 0, 0, 0, 0]) {
                outPacket.writeUInt32(elem)  // unk38
            }
            // array size is always 5
            for (const elem of [0, 0, 0, 0, 0]) {
                outPacket.writeUInt32(elem) // unk39
            }
        }

        // flag & 0x400
        // outPacket.writeUInt8(0) // unk40
        // end of flag & 0x400

        if (user.worldRank != null) {
            outPacket.writeUInt32(user.worldRank) // rank in world
            outPacket.writeUInt32(0) // unk42
        }

        // flag & 0x1000
        // outPacket.writeUInt8(0) // unk43
        // outPacket.writeUInt16(255) // unk44
        // outPacket.writeUInt32(0) // unk45
        // end of flag & 0x1000

        if (user.mpoints != null) {
            outPacket.writeUInt32(user.mpoints) // MPoint
            outPacket.writeUInt64(new Uint64LE(0)) // unk47
        }

        // flag & 0x4000
        // outPacket.writeUInt32(0) // unk48
        // end of flag & 0x4000

        if (user.titleId != null) {
            outPacket.writeUInt16(user.titleId) // title
        }

        // flag & 0x10000
        // outPacket.writeUInt16(0) // unk50
        // end of flag & 0x10000

        if (user.unlockedTitles != null && user.unlockedTitles.length === 128) {
            for (const elem of user.unlockedTitles) {
                outPacket.writeUInt8(elem) // title list
            }
        }

        if (user.signature != null) {
            outPacket.writeString(new PacketString(user.signature)) // personal signature
        }

        // flag & 0x80000
        // outPacket.writeUInt8(0) // unk53
        // outPacket.writeUInt8(0) // unk54
        // end of flag & 0x80000

        if (user.bestGamemode != null || user.bestMap != null) {
            outPacket.writeUInt32(7) // unk55
            outPacket.writeUInt32(user.bestGamemode) // best gamemode
            outPacket.writeUInt32(user.bestMap) // best map
        }

        // flag & 0x200000
        // outPacket.writeUInt16(0) // unk58
        // end of flag & 0x200000

        if (user.unlockedTitles != null && user.unlockedTitles.length === 128) {
            for (const elem of user.unlockedAchievements) {
                outPacket.writeUInt8(elem) // achievement unlocked (all 0xFF only 1024 unlocked)
            }
            outPacket.writeUInt32(0xA5C8) // unk60
        }

        if (user.avatar != null) {
            outPacket.writeUInt16(user.avatar)
        }

        // flag & 0x1000000
        // outPacket.writeUInt16(0) // unk62
        // end of flag & 0x1000000

        if (user.unlockedAvatars != null && user.unlockedAvatars.length === 128) {
            for (const elem of user.unlockedAvatars) {
                outPacket.writeUInt8(elem) // avatar list
            }
        }

        if (user.vipLevel != null || user.vipXp != null) {
            outPacket.writeUInt8(user.isVip() ? 1 : 0) // isVip
            outPacket.writeUInt8(user.vipLevel) // vipLevel
            outPacket.writeUInt32(user.vipXp) // vipExp
        }

        // flag & 0x8000000
        // outPacket.writeUInt32(0) // unk67
        // end of flag & 0x8000000

        if (user.skillHumanCurXp != null || user.skillHumanMaxXp != null
            || user.skillHumanPoints != null || user.skillZombieCurXp != null
            || user.skillZombieMaxXp != null || user.skillZombiePoints != null) {
            // skill factory start
            outPacket.writeUInt64(new Uint64LE(user.skillHumanCurXp)) // human exp
            outPacket.writeUInt64(new Uint64LE(user.skillHumanMaxXp)) // human max exp
            outPacket.writeUInt8(user.skillHumanPoints) // human skill point
            outPacket.writeUInt64(new Uint64LE(user.skillZombieCurXp)) // zombie exp
            outPacket.writeUInt64(new Uint64LE(user.skillZombieMaxXp)) // zombie max exp
            outPacket.writeUInt8(user.skillZombiePoints) // zombie skill point
            // skill factory end
            outPacket.writeUInt32(0) // unk74
            outPacket.writeUInt32(0) // unk75
            outPacket.writeUInt32(0) // unk76
            outPacket.writeUInt32(0) // unk77
            outPacket.writeUInt32(0) // unk78
            outPacket.writeUInt32(0) // unk79
        }

        // flag & 0x20000000
        // outPacket.writeUInt32(0) // unk80
        // outPacket.writeUInt32(0) // unk81
        // end of flag & 0x20000000

        // flag & 0x40000000
        // outPacket.writeUInt8(0) // unk82
        // outPacket.writeUInt8(0) // unk83
        // outPacket.writeUInt8(0) // unk84
        // end of flag & 0x40000000
    }

    private static GetFlagsUsed(user: User): number {
        let flags = 0

        // flag & 0x1
        // outPacket.writeUInt64(new Uint64LE(0x2241158F)) // unk00, nexon id?
        // end flag & 0x1

        if (user.playerName != null) {
            flags |= 0x2
        }

        if (user.level != null) {
            flags |= 0x4
        }

        if (user.curExp != null || user.maxExp != null) {
            flags |= 0x8
        }

        if (user.rank != null || user.rankFrame != null) {
            flags |= 0x10
        }

        if (user.points != null) {
            flags |= 0x20
        }

        if (user.playedMatches != null || user.wins != null || user.kills != null
            || user.headshots != null || user.deaths != null || user.assists != null
            || user.accuracy != null || user.secondsPlayed != null) {
            flags |= 0x40
        }

        if (user.netCafeName != null) {
            flags |= 0x80
        }

        if (user.cash != null) {
            flags |= 0x100
        }

        if (user.clanName != null || user.clanMark != null) {
            flags |= 0x200
        }

        // flag & 0x400
        // outPacket.writeUInt8(0) // unk40
        // end of flag & 0x400

        if (user.worldRank != null) {
            flags |= 0x800
        }

        // flag & 0x1000
        // outPacket.writeUInt8(0) // unk43
        // outPacket.writeUInt16(255) // unk44
        // outPacket.writeUInt32(0) // unk45
        // end of flag & 0x1000

        if (user.mpoints != null) {
            flags |= 0x2000
        }

        // flag & 0x4000
        // outPacket.writeUInt32(0) // unk48
        // end of flag & 0x4000

        if (user.titleId != null) {
            flags |= 0x8000
        }

        // flag & 0x10000
        // outPacket.writeUInt16(0) // unk50
        // end of flag & 0x10000

        if (user.unlockedTitles != null && user.unlockedTitles.length === 128) {
            flags |= 0x20000
        }

        if (user.signature != null) {
            flags |= 0x40000
        }

        // flag & 0x80000
        // outPacket.writeUInt8(0) // unk53
        // outPacket.writeUInt8(0) // unk54
        // end of flag & 0x80000

        if (user.bestGamemode != null || user.bestMap != null) {
            flags |= 0x100000
        }

        // flag & 0x200000
        // outPacket.writeUInt16(0) // unk58
        // end of flag & 0x200000

        if (user.unlockedTitles != null && user.unlockedTitles.length === 128) {
            flags |= 0x400000
        }

        if (user.avatar != null) {
            flags |= 0x800000
        }

        // flag & 0x1000000
        // outPacket.writeUInt16(0) // unk62
        // end of flag & 0x1000000

        if (user.unlockedAvatars != null && user.unlockedAvatars.length === 128) {
            flags |= 0x2000000
        }

        if (user.vipLevel != null || user.vipXp != null) {
            flags |= 0x4000000
        }

        // flag & 0x8000000
        // outPacket.writeUInt32(0) // unk67
        // end of flag & 0x8000000

        if (user.skillHumanCurXp != null || user.skillHumanMaxXp != null
            || user.skillHumanPoints != null || user.skillZombieCurXp != null
            || user.skillZombieMaxXp != null || user.skillZombiePoints != null) {
            flags |= 0x10000000
        }

        // flag & 0x20000000
        // outPacket.writeUInt32(0) // unk80
        // outPacket.writeUInt32(0) // unk81
        // end of flag & 0x20000000

        // flag & 0x40000000
        // outPacket.writeUInt8(0) // unk82
        // outPacket.writeUInt8(0) // unk83
        // outPacket.writeUInt8(0) // unk84
        // end of flag & 0x40000000

        return flags
    }
}
