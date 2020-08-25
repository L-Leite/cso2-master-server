import LRU from 'lru-cache'
import superagent from 'superagent'

import { userSvcAuthority, UserSvcPing } from 'authorities'
import { InventoryCosmetics } from 'entities/inventory/cosmetics'

export class InventoryService {
  /**
   * get an user's cosmetics by its ID
   * @param userId the target user's ID
   * @returns the cosmetics object if found, null otherwise
   */
  public static async GetCosmetics(
    userId: number
  ): Promise<InventoryCosmetics> {
    try {
      const cachedCosmetics = cosmeticsCache.get(userId)

      if (cachedCosmetics != null) {
        return cachedCosmetics
      }

      if (UserSvcPing.isAlive() === false) {
        return null
      }

      const res: superagent.Response = await superagent
        .get(`http://${userSvcAuthority()}/inventory/${userId}/cosmetics`)
        .accept('json')

      if (res.status !== 200) {
        return null
      }

      return res.body as InventoryCosmetics
    } catch (error) {
      await UserSvcPing.checkNow()
      throw error
    }
  }
}

const cosmeticsCache = new LRU<number, InventoryCosmetics>({
  max: 100,
  maxAge: 1000 * 15
})
