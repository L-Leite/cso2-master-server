import { sql } from 'db'

export type ISetBuyMenuBody = {
    pistols: number[]
    shotguns: number[]
    smgs: number[]
    rifles: number[]
    snipers: number[]
    machineguns: number[]
    melees: number[]
    equipment: number[]

    [state: string]: number[]
}

/**
 * an user's ingame buy menu
 */
export class InventoryBuyMenu {
    /**
     * get an user's buy menu
     * @param userId the owning user's ID
     * @returns a promise to the user's buy menu
     */
    public static async getById(userId: number): Promise<InventoryBuyMenu> {
        const resRows = await sql<
            InventoryBuyMenu
        >`SELECT * FROM inventory_buymenues WHERE owner_id = ${userId};`

        if (resRows.count === 0) {
            return null
        } else if (resRows.count === 1) {
            return resRows[0]
        } else {
            throw new Error('getById: got more than one row for an inventory')
        }
    }

    /**
     * create a buy menu for an user
     * @param userId the owner's user ID
     * @returns a promise to the user's new buy menu
     */
    public static async create(userId: number): Promise<InventoryBuyMenu> {
        const res = await sql<
            InventoryBuyMenu
        >`INSERT INTO inventory_buymenues(owner_id) VALUES(${userId}) RETURNING *;`

        if (res.count !== 1) {
            throw new Error('INSERT query did not return a single row')
        }

        return res[0]
    }

    /**
     * set an user's buy menu
     * @param updatedBuyMenu the updated buy menu
     * @param userId the owning user's ID
     * @returns true if the buy menu was updated sucessfully,
     *          false if it wasn't (the user doesn't exist)
     */
    public static async set(
        updatedBuyMenu: ISetBuyMenuBody,
        userId: number
    ): Promise<boolean> {
        if ((await this.getById(userId)) == null) {
            return false
        }

        for (const key in updatedBuyMenu) {
            if (updatedBuyMenu.hasOwnProperty(key)) {
                const values = updatedBuyMenu[key]
                await sql.unsafe(`
                    UPDATE inventory_buymenues
                    SET ${key} = ARRAY[${values.toString()}]::integer[]
                    WHERE owner_id = ${userId};
                `)
            }
        }

        return true
    }

    /**
     * delete a buy menu by its owner user ID
     * @param userId the owner's user ID
     * @returns true if deleted successfully, or false if the user does not exist
     */
    public static async remove(userId: number): Promise<boolean> {
        if ((await this.getById(userId)) == null) {
            return false
        }

        await sql`
            DELETE FROM inventory_buymenues
            WHERE owner_id = ${userId};
        `
        return true
    }

    public owner_id: number
    public pistols: number[]
    public shotguns: number[]
    public smgs: number[]
    public rifles: number[]
    public snipers: number[]
    public machineguns: number[]
    public melees: number[]
    public equipment: number[]
}
