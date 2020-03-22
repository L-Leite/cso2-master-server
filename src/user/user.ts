import LRU from 'lru-cache'
import superagent from 'superagent'

import { userSvcAuthority, UserSvcPing } from 'authorities'

/**
 * represents an user account
 */
export class User {
    /**
     * get an user's by its ID
     * @param userId the user's ID
     * @returns the user object if found, null otherwise
     */
    public static async get(userId: number): Promise<User> {
        try {
            let session: User = userCache.get(userId)

            if (session != null) {
                return session
            }

            if (UserSvcPing.isAlive() === false) {
                return null
            }

            const res: superagent.Response = await superagent
                .get('http://' + userSvcAuthority() + '/users/' + userId)
                .accept('json')
            if (res.status === 200) {
                // HACK to get methods working
                session = new User()
                Object.assign(session, res.body)
                userCache.set(session.userId, session)
                return session
            }
            return null
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
            return null
        }
    }

    /**
     * get an user's by its name
     * @param userName the target's user name
     */
    public static async getByName(userName: string): Promise<User> {
        try {
            if (UserSvcPing.isAlive() === false) {
                return null
            }

            const res: superagent.Response = await superagent
                .get('http://' + userSvcAuthority() + '/users/byname/' + userName)
                .accept('json')
            if (res.status === 200) {
                // HACK to get, methods working
                const newBody: User = new User()
                Object.assign(newBody, res.body)
                return newBody
            } else {
                return null
            }
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
            return null
        }
    }

    public userId: number
    public userName: string
    public playerName: string

    public points: number
    public cash: number
    public mpoints: number

    public level: number
    public curExp: number
    public maxExp: number
    public vipLevel: number

    public rank: number
    public rankFrame: number

    public playedMatches: number
    public wins: number
    public secondsPlayed: number

    public kills: number
    public deaths: number
    public assists: number
    public headshots: number
    public accuracy: number

    public avatar: number
    public unlockedAvatars: number[]

    public netCafeName: string

    public clanName: string
    public clanMark: number

    public worldRank: number

    public titleId: number
    public unlockedTitles: number[]
    public signature: string

    public bestGamemode: number
    public bestMap: number

    public unlockedAchievements: number[]

    public skillHumanCurXp: number
    public skillHumanMaxXp: number
    public skillHumanPoints: number
    public skillZombieCurXp: number
    public skillZombieMaxXp: number
    public skillZombiePoints: number

    /**
     * is the user a VIP?
     * @returns true if so, false if not
     */
    public isVip(): boolean {
        return this.vipLevel !== 0
    }
}

const userCache = new LRU<number, User>({ max: 100, maxAge: 1000 * 15 })
