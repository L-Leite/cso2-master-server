import { sql } from 'db'
import { SetupSetParams } from 'utilitites'

const MAX_LOADOUTS = 3

export type ISetLoadoutBody = {
    primary?: number
    secondary?: number
    melee?: number
    hegrenade?: number
    flash?: number
    smoke?: number
}

/**
 * stores an user's loadout items at a slot
 */
export class InventoryLoadout {
    /**
     * get an user's loadout
     * @param loadoutNum the loadout's index number
     * @param userId the owning user's ID
     * @returns a promise to the user's loadout
     */
    public static async getById(
        loadoutNum: number,
        userId: number
    ): Promise<InventoryLoadout> {
        const resRows = await sql<InventoryLoadout>`
            SELECT * FROM inventory_loadouts
            WHERE owner_id = ${userId} AND loadout_num = ${loadoutNum};`

        if (resRows.count === 0) {
            return null
        } else if (resRows.count === 1) {
            return resRows[0]
        } else {
            throw new Error('getById: got more than one row for an inventory')
        }
    }

    /**
     * create loadouts for an user
     * @param userId the owner's user ID
     * @returns a promise to the user's inventory items
     */
    public static async create(userId: number): Promise<InventoryLoadout[]> {
        const newLoadouts: InventoryLoadout[] = []

        for (let i = 0; i < MAX_LOADOUTS; i++) {
            const res = await sql<InventoryLoadout>`
                INSERT INTO inventory_loadouts(owner_id, loadout_num)
                VALUES(${userId}, ${i}) RETURNING *;`

            if (res.count !== 1) {
                throw new Error('INSERT query did not return a single row')
            }

            newLoadouts.push(res[0])
        }

        return newLoadouts
    }

    /**
     * set an user's loadout
     * @param updatedLoadout the updated loadout
     * @param userId the owning user's ID
     * @returns true if the loadout was updated sucessfully,
     *          false if it wasn't (the user doesn't exist)
     */
    public static async set(
        updatedLoadout: ISetLoadoutBody,
        userId: number,
        loadoutNum: number
    ): Promise<boolean> {
        if ((await this.getById(loadoutNum, userId)) == null) {
            return false
        }

        await sql`
            UPDATE inventory_loadouts
            SET ${sql(updatedLoadout, ...SetupSetParams(updatedLoadout))}
            WHERE owner_id = ${userId}
            AND loadout_num = ${loadoutNum};
        `

        return true
    }

    /**
     * delete any loadouts by its owner user ID
     * @param userId the owner's user ID
     * @returns a promise returning true if deleted successfully, or false if not
     */
    public static async remove(userId: number): Promise<boolean> {
        if ((await this.getById(0, userId)) == null) {
            return false
        }

        await sql`
            DELETE FROM inventory_loadouts
            WHERE owner_id = ${userId};
        `
        return true
    }

    public owner_id: number
    public loadout_num: number
    public primary_weapon: number
    public secondary_weapon: number
    public melee: number
    public hegrenade: number
    public flash: number
    public smoke: number
}
