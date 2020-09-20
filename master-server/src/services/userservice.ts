import LRUCache from 'lru-cache'
import superagent from 'superagent'

import { UserSvcPing } from 'authorities'
import { User } from 'user/user'

export class UserService {
    private static baseUrl: string

    private static userCache: LRUCache<number, User>

    public static Init(baseUrl: string): void {
        this.baseUrl = baseUrl

        this.userCache = new LRUCache<number, User>({
            max: 100,
            maxAge: 1000 * 15
        })
    }

    /**
     * get an user's by its ID
     * @param userId the user's ID
     * @returns the user object if found, null otherwise
     */
    public static async Login(
        username: string,
        password: string
    ): Promise<number> {
        if (UserSvcPing.isAlive() === false) {
            return 0
        }

        try {
            const res: superagent.Response = await superagent
                .post(this.baseUrl + '/users/auth/login')
                .send({
                    username,
                    password
                })
                .accept('json')

            if (res.status === 200) {
                const typedBody = res.body as { userId: number }
                return typedBody.userId
            }
        } catch (error) {
            const typedError = error as { status: number }
            if (typedError.status === 401) {
                return -1
            }
            console.error(error)
            await UserSvcPing.checkNow()
        }

        return 0
    }

    /**
     * get an user's by its ID
     * @param userId the user's ID
     * @returns the user object if found, null otherwise
     */
    public static async Logout(userId: number): Promise<boolean> {
        if (UserSvcPing.isAlive() === false) {
            return false
        }

        try {
            const res: superagent.Response = await superagent
                .post(this.baseUrl + '/users/auth/logout')
                .send({
                    userId
                })
                .accept('json')

            if (res.status === 200) {
                return true
            }
        } catch (error) {
            console.error(error)
            await UserSvcPing.checkNow()
        }

        return false
    }

    /**
     * get an user's by its ID
     * @param userId the user's ID
     * @returns the user object if found, null otherwise
     */
    public static async GetUserById(userId: number): Promise<User> {
        try {
            let user: User = this.userCache.get(userId)

            if (user != null) {
                return user
            }

            if (UserSvcPing.isAlive() === false) {
                return null
            }

            const res: superagent.Response = await superagent
                .get(this.baseUrl + `/users/${userId}`)
                .accept('json')
            if (res.status === 200) {
                // HACK to get methods working
                user = new User()
                Object.assign(user, res.body)
                this.userCache.set(user.id, user)
                return user
            }
            return null
        } catch (error) {
            console.error(error)
            await UserSvcPing.checkNow()
            return null
        }
    }

    /**
     * update an user
     * @param targetUser the user containing the data to be updated
     * @returns true if updated, false if not
     */
    public static async Update(targetUser: User): Promise<boolean> {
        try {
            const res: superagent.Response = await superagent
                .put(this.baseUrl + `/users/${targetUser.id}`)
                .send(targetUser)
                .accept('json')

            if (res.status === 200) {
                this.userCache.set(targetUser.id, targetUser)
                console.log('Set buy menu successfully')
                return true
            }
        } catch (error) {
            console.error(error)
            await UserSvcPing.checkNow()
        }

        return false
    }

    /**
     * update an user
     * @param updatedMembers the user fields to be updated
     * @returns true if updated, false if not
     */
    public static async UpdatePartial(
        updatedMembers: Omit<Partial<User>, 'id'>,
        targetUserId: number
    ): Promise<boolean> {
        try {
            const res: superagent.Response = await superagent
                .put(this.baseUrl + `/users/${targetUserId}`)
                .send(updatedMembers)
                .accept('json')

            if (res.status === 200) {
                if (this.userCache.has(targetUserId) === true) {
                    const cachedUser = this.userCache.get(targetUserId)
                    Object.assign(cachedUser, updatedMembers)
                    this.userCache.set(targetUserId, cachedUser)
                }

                console.log('Updated user partially successfully')
                return true
            }
        } catch (error) {
            console.error(error)
            await UserSvcPing.checkNow()
        }

        return false
    }
}
