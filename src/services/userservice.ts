
import LRUCache from 'lru-cache'
import superagent from 'superagent'

import { UserSvcPing } from 'authorities'
import { User } from 'user/user'

export class UserService {
  private baseUrl: string

  private userCache: LRUCache<number, User>

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl

    this.userCache = new LRUCache<number, User>({ max: 100, maxAge: 1000 * 15 })
  }

  /**
   * get an user's by its ID
   * @param userId the user's ID
   * @returns the user object if found, null otherwise
   */
  public async GetUserById(userId: number): Promise<User> {
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
        this.userCache.set(user.userId, user)
        return user
      }
      return null
    } catch (error) {
      console.error(error)
      UserSvcPing.checkNow()
      return null
    }
  }

  /**
   * sets an user's avatar
   * @param targetUserId the ID of the user to have the avatar updated
   * @param avatarId the new avatar's ID
   * @returns true if updated, false if not
   */
  public async SetUserAvatar(targetUserId: number, avatarId: number): Promise<boolean> {
    try {
      const res: superagent.Response = await superagent
        .put(this.baseUrl + `/users/${targetUserId}`)
        .send({
          avatar: avatarId,
        })
        .accept('json')

      if (res.status === 200) {
        const entry: User = this.userCache.get(targetUserId)
        if (entry != null) {
          entry.avatar = avatarId
          this.userCache.set(targetUserId, entry)
        }

        console.log('Set title successfully')
        return true;
      }
    } catch (error) {
      console.error(error)
      UserSvcPing.checkNow()
    }

    return false;
  }

  /**
   * update an user
   * @param targetUser the user and the user data to be updated
   * @returns true if updated, false if not
   */
  public async Update(targetUser: User): Promise<boolean> {
    try {
      const res: superagent.Response = await superagent
        .put(this.baseUrl + `/users/${targetUser.userId}`)
        .send(targetUser)
        .accept('json')

      if (res.status === 200) {
        this.userCache.set(targetUser.userId, targetUser)
        console.log('Set buy menu successfully')
        return true;
      }
    } catch (error) {
      console.error(error)
      UserSvcPing.checkNow()
    }

    return false;
  }
}
