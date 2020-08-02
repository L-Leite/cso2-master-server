import { sql } from 'db'

import { InventoryItem } from 'entities/inventory/item'

function FixInventoryStructure(
    inv: Inventory | { items: number[][] }
): Inventory {
    const newInv = new Inventory()
    /* newInv.owner_id = (inv as Inventory).owner_id
    newInv.items = []

    for (let i = 0; i < inv.items.length; i++) {
        newInv.items[i] = new InventoryItem(
            (inv.items[i] as number[])[0],
            (inv.items[i] as number[])[1]
        )
    } */

    Object.assign(newInv, inv)
    return newInv
}

/**
 * represents an user's inventory
 */
export class Inventory {
    /**
     * get an user's inventory items
     * @param userId the owning user's ID
     * @returns a promise to the user's inventory items
     */
    public static async getById(userId: number): Promise<Inventory> {
        const resRows = await sql<
            Inventory
        >`SELECT * FROM inventories WHERE owner_id = ${userId};`

        if (resRows.count === 0) {
            return null
        } else if (resRows.count === 1) {
            return FixInventoryStructure(resRows[0])
        } else {
            throw new Error('getById: got more than one row for an inventory')
        }
    }

    /**
     * does an inventory exist?
     * @param userId the inventory owning user's ID
     * @returns true if so, false if not
     */
    public static async doesExist(userId: number): Promise<boolean> {
        const resRows = await sql<
            Inventory
        >`SELECT 1 FROM inventories WHERE owner_id = ${userId};`

        if (resRows.count > 1) {
            throw new Error('getById: got more than one row for an inventory')
        }

        return resRows.count === 1
    }

    /**
     * create an user's inventory
     * @param userId the owner's user ID
     * @returns a promise to the user's inventory items
     */
    public static async create(userId: number): Promise<Inventory> {
        const res = await sql<Inventory>`
            INSERT INTO inventories (owner_id) VALUES (${userId}) RETURNING *;`

        if (res.count !== 1) {
            throw new Error('INSERT query did not return a single row')
        }

        return FixInventoryStructure(res[0])
    }

    /**
     * delete an in ventory by its owner user ID
     * @param userId the owner's user ID
     * @returns true if deleted successfully, or false if the user does not exist
     */
    public static async remove(userId: number): Promise<boolean> {
        if ((await this.doesExist(userId)) === false) {
            return false
        }

        await sql`
            DELETE FROM inventories
            WHERE owner_id = ${userId};`
        return true
    }

    /**
     * add an item to an user's inventory
     * @param itemId the item's ID
     * @param itemAmmount the ammount of items
     * @param userId the owning user's ID
     * @returns a promise that returns true if the item was added sucessfully,
     *          false if it wasn't (the user doesn't exist)
     */
    public static async addItem(
        itemId: number,
        itemAmmount: number,
        userId: number
    ): Promise<boolean> {
        if ((await this.doesExist(userId)) === false) {
            return false
        }

        await sql`
            UPDATE inventories
            SET items = items || (${itemId}, ${itemAmmount})::InventoryItem
            WHERE owner_id = ${userId};
        `

        return true
    }

    /**
     * remove an item from an user's inventory
     * if itemAmmount IS provided, it will decrement the item's ammount by that value
     * -- if the resulting ammount is zero or less than zero, the item will be deleted
     * if itemAmmount is NOT provided, the item will be completely removed from the inventory
     * @param itemId the ID of the item to delete
     * @param userId the owning user's ID
     * @param itemAmmount the ammount of items to delete (default: null)
     * @returns a promise that returns true if anything was altered, false if not
     */
    public static async removeItem(
        itemId: number,
        userId: number,
        itemAmmount?: number
    ): Promise<boolean> {
        if (itemAmmount) {
            const inv: Inventory = await Inventory.getById(userId)

            const targetItem: InventoryItem = inv.items.find(
                (item: InventoryItem) => {
                    return item.item_id === itemId
                }
            )

            const newAmmount: number = targetItem.ammount - itemAmmount

            if (newAmmount > 0) {
                // just decrement the ammount if we have enough item quantity
                return await Inventory.updateItemQuantity(
                    itemId,
                    newAmmount,
                    userId
                )
            } else {
                // delete the item if the ammount is zero or less
                return await Inventory.removeItemInternal(itemId, userId)
            }
        } else {
            // just delete the item if no ammount is provided
            return await Inventory.removeItemInternal(itemId, userId)
        }
    }

    /**
     * remove an item from an user's inventory
     * @param itemId the ID of the item to delete
     * @param ownerId the owning user's ID
     * @returns a promise that returns true if deleted successfully, false if not
     */
    private static async removeItemInternal(
        itemId: number,
        ownerId: number
    ): Promise<boolean> {
        const userInventory = await Inventory.getById(ownerId)

        if (userInventory == null) {
            throw new Error(
                'Tried to delete an item from a non existing inventory'
            )
        }

        const oldItem = userInventory.GetItemById(itemId)

        if (oldItem == null) {
            throw new Error('Could not find an item to be deleted')
        }

        await sql`
            UPDATE inventories
            SET items = array_remove(items, (${oldItem.item_id}, ${oldItem.ammount})::InventoryItem)
            WHERE owner_id = ${ownerId};
        `
        return true
    }

    /**
     * update an item's quantity in an user's inventory
     * @param itemId the ID of the item to delete
     * @param newAmmount the new item's quantity
     * @param ownerId the owning user's ID
     * @returns a promise that returns true if updated successfully, false if not
     */
    private static async updateItemQuantity(
        itemId: number,
        newAmmount: number,
        ownerId: number
    ): Promise<boolean> {
        const userInventory = await Inventory.getById(ownerId)

        if (userInventory == null) {
            throw new Error(
                'Tried to delete an item from a non existing inventory'
            )
        }

        const oldItem = userInventory.GetItemById(itemId)

        if (oldItem == null) {
            throw new Error('Could not find an item to be deleted')
        }

        const newItem = new InventoryItem(itemId, newAmmount)

        await sql`
            UPDATE inventories
            SET items = array_replace(
                items,
                (${oldItem.item_id}, ${oldItem.ammount})::InventoryItem,
                (${newItem.item_id}, ${newItem.ammount})::InventoryItem)
            WHERE owner_id = ${ownerId};
        `

        return true
    }

    public GetItemById(targetItemId: number): InventoryItem {
        for (const item of this.items) {
            if (item.item_id === targetItemId) {
                return item
            }
        }

        return null
    }

    public owner_id: number
    public items: InventoryItem[]
}
