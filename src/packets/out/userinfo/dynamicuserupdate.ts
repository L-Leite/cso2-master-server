import { Uint64LE } from 'int64-buffer'

import { OutPacketBase } from 'packets/out/packet'

import { User } from 'user/user'

/**
 * sends only an user's changed data
 */
export class UserInfoDynamicUpdate {
    /**
     * builds the sub structure to a packet's stream buffer
     * @param outPacket the packet where the data will go
     */
    public static build(userObj: any, outPacket: OutPacketBase): void {
        const user: User = userObj

        // outPacket.writeUInt32(this.userId)

        outPacket.writeUInt32(this.GetFlagsUsed(user)) // flags

        // flag & 0x1
        // outPacket.writeUInt64(new Uint64LE(0x2241158F)) // unk00, nexon id?
        // end flag & 0x1

        if (user.playername != null) {
            outPacket.writeString(user.playername) // userName
        }

        if (user.level != null) {
            outPacket.writeUInt16(user.level) // level
        }

        if (user.cur_xp != null || user.max_xp != null) {
            outPacket.writeUInt64(new Uint64LE(user.cur_xp.toString())) // curExp
            outPacket.writeUInt64(new Uint64LE(user.max_xp.toString())) // maxExp
            outPacket.writeUInt32(0x313) // unk03
        }

        if (user.rank != null || user.rank_frame != null) {
            outPacket.writeUInt8(user.rank) // rank
            outPacket.writeUInt8(user.rank_frame) // rankframe(item id: 9000-9003)
        }

        if (user.points != null) {
            outPacket.writeUInt64(new Uint64LE(user.points)) // Points
        }

        if (user.played_matches != null || user.wins != null || user.kills != null
            || user.headshots != null || user.deaths != null || user.assists != null
            || user.accuracy != null || user.seconds_played != null) {
            outPacket.writeUInt32(user.played_matches) // played game
            outPacket.writeUInt32(user.wins) // wins (win rate = wins / player game)
            outPacket.writeUInt32(user.kills) // kills
            outPacket.writeUInt32(user.headshots) // headshots (hs rate = hs / kills)
            outPacket.writeUInt32(user.deaths) // deaths
            outPacket.writeUInt32(user.assists) // assists
            outPacket.writeUInt16(user.accuracy) // hit rate
            outPacket.writeUInt32(user.seconds_played) // played time (s)
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

        if (user.netcafe_name != null) {
            outPacket.writeString(null) // unk26
            outPacket.writeUInt32(0) // unk27
            outPacket.writeUInt32(0) // unk28
            outPacket.writeUInt32(0) // unk29
            outPacket.writeUInt32(0) // unk30
            outPacket.writeString(user.netcafe_name) // net cafe
        }

        if (user.cash != null) {
            outPacket.writeUInt32(user.cash) // Cash
            outPacket.writeUInt32(0) // unk33
        }

        if (user.clan_name != null || user.clan_mark != null) {
            outPacket.writeUInt32(0) // unk34
            outPacket.writeString(user.clan_name) // clan name
            outPacket.writeUInt32(user.clan_mark) // clan mark (0-10)
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

        if (user.world_rank != null) {
            outPacket.writeUInt32(user.world_rank) // rank in world
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

        if (user.title != null) {
            outPacket.writeUInt16(user.title) // title
        }

        // flag & 0x10000
        // outPacket.writeUInt16(0) // unk50
        // end of flag & 0x10000

        if (user.unlocked_titles != null && user.unlocked_titles.length === 128) {
            for (const elem of user.unlocked_titles) {
                outPacket.writeUInt8(elem) // title list
            }
        }

        if (user.signature != null) {
            outPacket.writeString(user.signature) // personal signature
        }

        // flag & 0x80000
        // outPacket.writeUInt8(0) // unk53
        // outPacket.writeUInt8(0) // unk54
        // end of flag & 0x80000

        if (user.best_gamemode != null || user.best_map != null) {
            outPacket.writeUInt32(7) // unk55
            outPacket.writeUInt32(user.best_gamemode) // best gamemode
            outPacket.writeUInt32(user.best_map) // best map
        }

        // flag & 0x200000
        // outPacket.writeUInt16(0) // unk58
        // end of flag & 0x200000

        if (user.unlocked_titles != null && user.unlocked_titles.length === 128) {
            for (const elem of user.unlocked_achievements) {
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

        if (user.unlocked_avatars != null && user.unlocked_avatars.length === 128) {
            for (const elem of user.unlocked_avatars) {
                outPacket.writeUInt8(elem) // avatar list
            }
        }

        if (user.vip_level != null || user.vip_xp != null) {
            outPacket.writeUInt8(user.isVip() ? 1 : 0) // isVip
            outPacket.writeUInt8(user.vip_level) // vipLevel
            outPacket.writeUInt32(user.vip_xp) // vipExp
        }

        // flag & 0x8000000
        // outPacket.writeUInt32(0) // unk67
        // end of flag & 0x8000000

        if (user.skill_human_curxp != null || user.skill_human_maxxp != null
            || user.skill_human_points != null || user.skill_zombie_curxp != null
            || user.skill_zombie_maxxp != null || user.skill_zombie_points != null) {
            // skill factory start
            outPacket.writeUInt64(new Uint64LE(user.skill_human_curxp.toString())) // human exp
            outPacket.writeUInt64(new Uint64LE(user.skill_human_maxxp.toString())) // human max exp
            outPacket.writeUInt8(user.skill_human_points) // human skill point
            outPacket.writeUInt64(new Uint64LE(user.skill_zombie_curxp.toString())) // zombie exp
            outPacket.writeUInt64(new Uint64LE(user.skill_zombie_maxxp.toString())) // zombie max exp
            outPacket.writeUInt8(user.skill_zombie_points) // zombie skill point
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

        if (user.playername != null) {
            flags |= 0x2
        }

        if (user.level != null) {
            flags |= 0x4
        }

        if (user.cur_xp != null || user.max_xp != null) {
            flags |= 0x8
        }

        if (user.rank != null || user.rank_frame != null) {
            flags |= 0x10
        }

        if (user.points != null) {
            flags |= 0x20
        }

        if (user.played_matches != null || user.wins != null || user.kills != null
            || user.headshots != null || user.deaths != null || user.assists != null
            || user.accuracy != null || user.seconds_played != null) {
            flags |= 0x40
        }

        if (user.netcafe_name != null) {
            flags |= 0x80
        }

        if (user.cash != null) {
            flags |= 0x100
        }

        if (user.clan_name != null || user.clan_mark != null) {
            flags |= 0x200
        }

        // flag & 0x400
        // outPacket.writeUInt8(0) // unk40
        // end of flag & 0x400

        if (user.world_rank != null) {
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

        if (user.title != null) {
            flags |= 0x8000
        }

        // flag & 0x10000
        // outPacket.writeUInt16(0) // unk50
        // end of flag & 0x10000

        if (user.unlocked_titles != null && user.unlocked_titles.length === 128) {
            flags |= 0x20000
        }

        if (user.signature != null) {
            flags |= 0x40000
        }

        // flag & 0x80000
        // outPacket.writeUInt8(0) // unk53
        // outPacket.writeUInt8(0) // unk54
        // end of flag & 0x80000

        if (user.best_gamemode != null || user.best_map != null) {
            flags |= 0x100000
        }

        // flag & 0x200000
        // outPacket.writeUInt16(0) // unk58
        // end of flag & 0x200000

        if (user.unlocked_titles != null && user.unlocked_titles.length === 128) {
            flags |= 0x400000
        }

        if (user.avatar != null) {
            flags |= 0x800000
        }

        // flag & 0x1000000
        // outPacket.writeUInt16(0) // unk62
        // end of flag & 0x1000000

        if (user.unlocked_avatars != null && user.unlocked_avatars.length === 128) {
            flags |= 0x2000000
        }

        if (user.vip_level != null || user.vip_xp != null) {
            flags |= 0x4000000
        }

        // flag & 0x8000000
        // outPacket.writeUInt32(0) // unk67
        // end of flag & 0x8000000

        if (user.skill_human_curxp != null || user.skill_human_maxxp != null
            || user.skill_human_points != null || user.skill_zombie_curxp != null
            || user.skill_zombie_maxxp != null || user.skill_zombie_points != null) {
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
