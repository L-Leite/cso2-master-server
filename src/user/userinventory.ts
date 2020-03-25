import LRU from 'lru-cache'
import superagent from 'superagent'

import { UserBuyMenu } from 'user/userbuymenu'
import { UserCosmetics } from 'user/usercosmetics'
import { UserInventoryItem } from 'user/userinventoryitem'
import { UserLoadout } from 'user/userloadout'

import { userSvcAuthority, UserSvcPing } from 'authorities'

export class UserInventory {
    /**
     * creates a new inventory, including cosmetics, loadouts and a buy menu
     * @param userId the new inventory owner's user ID
     * @returns true if successful, false if not
     */
    public static async create(userId: number): Promise<boolean> {
        if (UserSvcPing.isAlive() === false) {
            return false
        }

        const invPromises: Array<Promise<boolean>> = [
            UserInventory.createInventory(userId),
            UserInventory.createCosmetics(userId),
            UserInventory.createBuyMenu(userId),
            UserInventory.createLoadouts(userId),
        ]

        const results: boolean[] = await Promise.all(invPromises)

        // if results.includes returns false, then results doesn't have any false value
        return results.includes(false) !== false
    }

    /**
     * create inventory items for the owner user
     * @param ownerId the future inventory owner's user ID
     * @returns true if successful, false if not
     */
    public static async createInventory(ownerId: number): Promise<boolean> {
        try {
            const res: superagent.Response = await superagent
                .post(userSvcAuthority() + '/inventory/' + ownerId)
                .accept('json')
            return res.status === 201
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
            return false
        }
    }

    /**
     * create cosmetic slots for the owner user
     * @param ownerId the future cosmetics owner's user ID
     * @returns true if successful, false if not
     */
    public static async createCosmetics(ownerId: number): Promise<boolean> {
        try {
            const res: superagent.Response = await superagent
                .post(userSvcAuthority() + '/inventory/' + ownerId + '/cosmetics')
                .accept('json')
            return res.status === 201
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
            return false
        }
    }

    /**
     * create loadouts for the owner user
     * @param ownerId the future loadouts owner's user ID
     * @returns true if successful, false if not
     */
    public static async createLoadouts(ownerId: number): Promise<boolean> {
        try {
            const res: superagent.Response = await superagent
                .post(userSvcAuthority() + '/inventory/' + ownerId + '/loadout')
                .accept('json')
            return res.status === 201
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
            return false
        }
    }

    /**
     * create buy menu for the owner user
     * @param ownerId the future buy menu owner's user ID
     * @returns true if successful, false if not
     */
    public static async createBuyMenu(ownerId: number): Promise<boolean> {
        try {
            const res: superagent.Response = await superagent
                .post(userSvcAuthority() + '/inventory/' + ownerId + '/buymenu')
                .accept('json')
            return res.status === 201
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
            return null
        }
    }

    /**
     * get the inventory owner's items
     * @param ownerId the inventory owner's user ID
     */
    public static async getInventory(ownerId: number): Promise<UserInventory> {
        try {
            const inventory: UserInventory = inventoryCache.get(ownerId)

            if (inventory != null) {
                return inventory
            }

            if (UserSvcPing.isAlive() === false) {
                return null
            }

            const res: superagent.Response = await superagent
                .get(userSvcAuthority() + '/inventory/' + ownerId)
                .accept('json')

            if (res.status === 200) {
                inventoryCache.set(ownerId, res.body)
                return res.body
            }

            return null
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
            return null
        }
    }

    /**
     * get an user's cosmetic items
     * @param ownerId the cosmetics owner's user ID
     */
    public static async getCosmetics(ownerId: number): Promise<UserCosmetics> {
        try {
            const cosmetics: UserCosmetics = cosmeticsCache.get(ownerId)

            if (cosmetics != null) {
                return cosmetics
            }

            if (UserSvcPing.isAlive() === false) {
                return null
            }

            const res: superagent.Response = await superagent
                .get(userSvcAuthority() + '/inventory/' + ownerId + '/cosmetics')
                .accept('json')

            if (res.status === 200) {
                cosmeticsCache.set(ownerId, res.body)
                return res.body
            }

            return null
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
            return null
        }
    }

    /**
     * get an user's loadout
     * @param ownerId the loadout owner's user ID
     * @param loadoutNum the loadout's index number
     */
    public static async getLoadout(ownerId: number, loadoutNum: number): Promise<UserLoadout> {
        try {
            const res: superagent.Response = await superagent
                .get(userSvcAuthority() + '/inventory/' + ownerId + '/loadout')
                .send({ loadoutNum })
                .accept('json')
            return res.status === 200 ? res.body : null
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
            return null
        }
    }

    /**
     * get every loadout from an user
     * @param ownerId the loadouts owner's user ID
     */
    public static async getAllLoadouts(ownerId: number): Promise<UserLoadout[]> {
        let loadouts: UserLoadout[] = loadoutsCache.get(ownerId)

        if (loadouts != null) {
            return loadouts
        }

        if (UserSvcPing.isAlive() === false) {
            return null
        }

        const loadoutPromises: Array<Promise<UserLoadout>> = []

        for (let i = 0; i < 3; i++) {
            loadoutPromises.push(UserInventory.getLoadout(ownerId, i))
        }

        loadouts = await Promise.all(loadoutPromises)
        loadoutsCache.set(ownerId, loadouts)
        return loadouts
    }

    /**
     * get an user's buy menu
     * @param ownerId the buy menu owner's user ID
     */
    public static async getBuyMenu(ownerId: number): Promise<UserBuyMenu> {
        try {
            const buymenu: UserBuyMenu = buymenuCache.get(ownerId)

            if (buymenu != null) {
                return buymenu
            }

            if (UserSvcPing.isAlive() === false) {
                return null
            }

            const res: superagent.Response = await superagent
                .get(userSvcAuthority() + '/inventory/' + ownerId + '/buymenu')
                .accept('json')

            if (res.status === 200) {
                buymenuCache.set(ownerId, res.body)
                return res.body
            }

            return null
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
            return null
        }
    }

    /**
     * sets an user's cosmetic slot with a new item
     * @param ownerId the cosmetics owner's user ID
     * @param slot the cosmetic slot
     * @param itemId the new cosmetic's item ID
     */
    public static async setCosmeticSlot(ownerId: number, slot: number, itemId: number): Promise<void> {
        const params = UserInventory.buildSetCosmeticParams(ownerId, slot, itemId)
        try {
            const res: superagent.Response = await superagent
                .put(userSvcAuthority() + '/inventory/' + ownerId + '/cosmetics')
                .send(params)
                .accept('json')

            if (res.status === 200) {
                cosmeticsCache.del(ownerId)
                console.log('Set cosmetic item successfully')
            }
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
        }
    }

    /**
     * sets a loadout's weapon slot with a different we
     * @param ownerId the loadout owner's user ID
     * @param loadout the loadout number
     * @param slot the weapon slot
     * @param itemId the new weapon's item id
     */
    public static async setLoadoutWeapon(ownerId: number, loadout: number,
                                         slot: number, itemId: number): Promise<void> {
        const params = UserInventory.buildSetLoadoutParams(ownerId, loadout, slot, itemId)
        try {
            const res: superagent.Response = await superagent
                .put(userSvcAuthority() + '/inventory/' + ownerId + '/loadout')
                .send(params)
                .accept('json')

            if (res.status === 200) {
                loadoutsCache.del(ownerId)
                console.log('Set loadout weapon successfully')
            }
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
        }
    }

    /**
     * sets an user's whole buy menu
     * @param ownerId the buy menu owner's user ID
     * @param column the buy menu's column index
     * @param items the new buy menu's column items
     */
    public static async setBuyMenu(ownerId: number, newBuyMenu: UserBuyMenu): Promise<void> {
        try {
            const res: superagent.Response = await superagent
                .put(userSvcAuthority() + '/inventory/' + ownerId + '/buymenu')
                .send(newBuyMenu)
                .accept('json')

            if (res.status === 200) {
                buymenuCache.del(ownerId)
                console.log('Set buy menu successfully')
            }
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
        }
    }

    /**
     * sets an user's buy menu column (such as the pistols column)
     * @param ownerId the buy menu owner's user ID
     * @param column the buy menu's column index
     * @param items the new buy menu's column items
     */
    public static async setBuyMenuColumn(ownerId: number, column: number, items: number[]): Promise<void> {
        const params = UserInventory.buildSetBuyMenuParams(column, items)
        try {
            const res: superagent.Response = await superagent
                .put(userSvcAuthority() + '/inventory/' + ownerId + '/buymenu')
                .send(params)
                .accept('json')

            if (res.status === 200) {
                buymenuCache.del(ownerId)
                console.log('Set buy menu column successfully')
            }
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
        }
    }

    private static buildSetCosmeticParams(userId: number, slot: number, itemId: number): any {
        switch (slot) {
            case 0:
                return {
                    userId,
                    ctItem: itemId,
                }
            case 1:
                return {
                    userId,
                    terItem: itemId,
                }
            case 2:
                return {
                    userId,
                    headItem: itemId,
                }
            case 3:
                return {
                    userId,
                    gloveItem: itemId,
                }
            case 4:
                return {
                    userId,
                    backItem: itemId,
                }
            case 5:
                return {
                    userId,
                    stepsItem: itemId,
                }
            case 6:
                return {
                    userId,
                    cardItem: itemId,
                }
            case 7:
                return {
                    userId,
                    sprayItem: itemId,
                }
        }

        console.error('Bad item slot for cosmetics')
        return null
    }

    private static buildSetLoadoutParams(userId: number, loadoutNum: number, slot: number, itemId: number): any {
        switch (slot) {
            case 0:
                return {
                    userId,
                    loadoutNum,
                    primary: itemId,
                }
            case 1:
                return {
                    userId,
                    loadoutNum,
                    secondary: itemId,
                }
            case 2:
                return {
                    userId,
                    loadoutNum,
                    melee: itemId,
                }
            case 3:
                return {
                    userId,
                    loadoutNum,
                    hegrenade: itemId,
                }
            case 4:
                return {
                    userId,
                    loadoutNum,
                    smoke: itemId,
                }
            case 5:
                return {
                    userId,
                    loadoutNum,
                    flash: itemId,
                }
        }

        console.error('Bad item slot for loadout')
        return null
    }

    private static buildSetBuyMenuParams(slot: number, items: number[]): any {
        switch (slot) {
            case 0:
                return {
                    pistols: items,
                }
            case 1:
                return {
                    shotguns: items,
                }
            case 2:
                return {
                    smgs: items,
                }
            case 3:
                return {
                    rifles: items,
                }
            case 4:
                return {
                    snipers: items,
                }
            case 5:
                return {
                    machineguns: items,
                }
            case 6:
                return {
                    melees: items,
                }
            case 7:
                return {
                    equipment: items,
                }
        }

        console.error('Bad column for buy menu')
        return null
    }

    public ownerId: number
    public items: UserInventoryItem[]
}

const inventoryCache = new LRU<number, UserInventory>({ max: 15, maxAge: 1000 * 15 })
const cosmeticsCache = new LRU<number, UserCosmetics>({ max: 30, maxAge: 1000 * 15 })
const loadoutsCache = new LRU<number, UserLoadout[]>({ max: 30, maxAge: 1000 * 15 })
const buymenuCache = new LRU<number, UserBuyMenu>({ max: 30, maxAge: 1000 * 15 })
