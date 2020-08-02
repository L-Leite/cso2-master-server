import { sql } from 'db'
import { SetupSetParams } from 'utilitites'

export type ISetCosmeticsBody = {
    ct_item?: number
    ter_item?: number
    head_item?: number
    glove_item?: number
    back_item?: number
    steps_item?: number
    card_item?: number
    spray_item?: number
}

/**
 * stores an user's equipped cosmetic items
 */
export class InventoryCosmetics {
    /**
     * get an user's equipped cosmetics
     * @param userId the owning user's ID
     * @returns a promise to the user's cosmetics
     */
    public static async getById(userId: number): Promise<InventoryCosmetics> {
        const resRows = await sql<
            InventoryCosmetics
        >`SELECT * FROM inventory_cosmetics WHERE owner_id = ${userId};`

        if (resRows.count === 0) {
            return null
        } else if (resRows.count === 1) {
            return resRows[0]
        } else {
            throw new Error('getById: got more than one row for an inventory')
        }
    }

    /**
     * create an user's inventory
     * @param userId the owner's user ID
     * @returns a promise to the user's inventory items
     */
    public static async create(userId: number): Promise<InventoryCosmetics> {
        const res = await sql<InventoryCosmetics>`
            INSERT INTO inventory_cosmetics(owner_id) VALUES(${userId}) RETURNING *;`

        if (res.count !== 1) {
            throw new Error('INSERT query did not return a single row')
        }

        return res[0]
    }

    /**
     * set an user's equipped cosmetics
     * @param updatedCosmetics the new cosmetics
     * @param userId the owning user's ID
     * @returns true if the cosmetics were updated sucessfully,
     *          false if it weren't (the user doesn't exist)
     */
    public static async set(
        updatedCosmetics: ISetCosmeticsBody,
        userId: number
    ): Promise<boolean> {
        if ((await this.getById(userId)) == null) {
            return false
        }

        await sql`
            UPDATE inventory_cosmetics
            SET ${sql(updatedCosmetics, ...SetupSetParams(updatedCosmetics))}
            WHERE owner_id = ${userId};
        `

        return true
    }

    /**
     * delete a cosmetics table by its owner user ID
     * @param userId the owner's user ID
     * @returns true if deleted successfully, or false if the user does not exist
     */
    public static async remove(userId: number): Promise<boolean> {
        if ((await this.getById(userId)) == null) {
            return false
        }

        await sql`
            DELETE FROM inventory_cosmetics
            WHERE owner_id = ${userId};
        `

        return true
    }

    public owner_id: number
    public ct_item: number
    public ter_item: number
    public head_item: number
    public glove_item: number
    public back_item: number
    public steps_item: number
    public card_item: number
    public spray_item: number
}
