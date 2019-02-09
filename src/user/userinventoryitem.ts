export class UserInventoryItem {

    /**
     * push an item and its count to an array
     * @param array the array to push to
     * @param item the item's id
     * @param count the item's ammount
     */
    public static pushItem(array: UserInventoryItem[], item: number, count: number = 1): void {
        array.push(new UserInventoryItem(item, count))
    }

    public id: number
    public count: number

    constructor(id: number, count: number) {
        this.id = id
        this.count = count
    }
}
