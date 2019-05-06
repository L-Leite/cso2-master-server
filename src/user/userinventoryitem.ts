export class UserInventoryItem {
    public itemId: number
    public ammount: number

    constructor(itemId: number, ammount: number = 1) {
        this.itemId = itemId
        this.ammount = ammount
    }
}
