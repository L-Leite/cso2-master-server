
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
  public async Login(username: string, password: string): Promise<boolean> {
    if (UserSvcPing.isAlive() === false) {
      return false
    }

    try {
      const res: superagent.Response = await superagent
        .post(this.baseUrl + `/auth/login`)
        .send({
          username,
          password,
        })
        .accept('json')

      if (res.status === 200) {
        return true
      }
    } catch (error) {
      console.error(error)
      UserSvcPing.checkNow()
    }

    return false
  }

  /**
   * get an user's by its ID
   * @param userId the user's ID
   * @returns the user object if found, null otherwise
   */
  public async Logout(userId: number): Promise<boolean> {
    if (UserSvcPing.isAlive() === false) {
      return false
    }

    try {
      const res: superagent.Response = await superagent
        .post(this.baseUrl + `/auth/logout`)
        .send({
          userId,
        })
        .accept('json')

      if (res.status === 200) {
        return true
      }
    } catch (error) {
      console.error(error)
      UserSvcPing.checkNow()
    }

    return false
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
   * @param targetUser the user to have the avatar updated
   * @param avatarId the new avatar's ID
   * @returns true if updated successfully, false if not
   */
  public async SetUserAvatar(targetUser: User, avatarId: number): Promise<boolean> {
    try {
      const res: superagent.Response = await superagent
        .put(this.baseUrl + `/users/${targetUser.userId}`)
        .send({
          avatar: avatarId,
        })
        .accept('json')

      if (res.status === 200) {
        targetUser.avatar = avatarId
        this.userCache.set(targetUser.userId, targetUser)
        return true;
      }
    } catch (error) {
      console.error(error)
      UserSvcPing.checkNow()
    }

    return false;
  }

  /**
   * sets an user's signature
   * @param targetUser the user to have the avatar updated
   * @param signature the new signature string
   * @returns true if updated successfully, false if not
   */
  public async SetUserSignature(targetUser: User, signature: string): Promise<boolean> {
    try {
      const res: superagent.Response = await superagent
        .put(this.baseUrl + `/users/${targetUser.userId}`)
        .send({
          signature,
        })
        .accept('json')

      if (res.status === 200) {
        targetUser.signature = signature
        this.userCache.set(targetUser.userId, targetUser)
        return true;
      }
    } catch (error) {
      console.error(error)
      UserSvcPing.checkNow()
    }

    return false;
  }

  /**
   * sets an user's title
   * @param targetUser the user to have the avatar updated
   * @param titleId the new title's ID
   * @returns true if updated successfully, false if not
   */
  public async SetUserTitle(targetUser: User, titleId: number): Promise<boolean> {
    try {
      const res: superagent.Response = await superagent
        .put(this.baseUrl + `/users/${targetUser.userId}`)
        .send({
          titleId,
        })
        .accept('json')

      if (res.status === 200) {
        targetUser.titleId = titleId
        this.userCache.set(targetUser.userId, targetUser)
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
