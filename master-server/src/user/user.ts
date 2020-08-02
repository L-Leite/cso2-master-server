/**
 * represents an user account
 */
export class User {
    public id: number
    public username: string
    public playername: string

    public gm: boolean

    public points: number
    public cash: number
    public mpoints: number

    public level: number
    public cur_xp: BigInt
    public max_xp: BigInt
    public vip_level: number
    public vip_xp: number

    public rank: number
    public rank_frame: number

    public played_matches: number
    public wins: number
    public seconds_played: number

    public kills: number
    public deaths: number
    public assists: number
    public headshots: number
    public accuracy: number

    public avatar: number
    public unlocked_avatars: number[]

    public title: number
    public unlocked_titles: number[]
    public signature: string

    public unlocked_achievements: number[]

    public campaign_flags: number

    public netcafe_name: string

    public clan_name: string
    public clan_mark: number

    public world_rank: number

    public best_gamemode: number
    public best_map: number

    public skill_human_curxp: BigInt
    public skill_human_maxxp: BigInt
    public skill_human_points: number
    public skill_zombie_curxp: BigInt
    public skill_zombie_maxxp: BigInt
    public skill_zombie_points: number

    /**
     * is the user a VIP?
     * @returns true if so, false if not
     */
    public isVip(): boolean {
        return this.vip_level !== 0
    }
}
