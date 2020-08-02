/**
 * represents an inventory item
 */
export class InventoryItem {
    public item_id: number
    public ammount: number

    /**
     * create an inventory item
     * @param itemId the item's id
     * @param ammount  the ammount of items
     */
    constructor(itemId: number, ammount = 1) {
        this.item_id = itemId
        this.ammount = ammount
    }
}
