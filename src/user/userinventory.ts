import { UserBuyMenu } from 'user/userbuymenu'
import { UserInventoryItem } from 'user/userinventoryitem'
import { UserLoadout } from 'user/userloadout'

export class UserInventory {
    public items: UserInventoryItem[]

    public ctModelItem: number
    public terModelItem: number
    public headItem: number
    public gloveItem: number
    public backItem: number
    public stepsItem: number
    public cardItem: number
    public sprayItem: number

    public buymenu: UserBuyMenu
    public loadouts: UserLoadout[]

    constructor() {
        this.ctModelItem = 1033
        this.terModelItem = 1034
        this.headItem = 10062
        this.gloveItem = 30018
        this.backItem = 20042
        this.stepsItem = 0
        this.sprayItem = 42003

        this.buymenu = new UserBuyMenu()
        this.buymenu.pistols = [5271, 5245, 5358, 5288, 106, 5119, 5121, 5360, 5294]
        this.buymenu.shotguns = [5130, 5181, 5157, 5282, 5286, 5343, 5264, 5265, 5230]
        this.buymenu.smgs = [5251, 5295, 162, 5132, 5346, 5320, 5287, 5321, 5310]
        this.buymenu.rifles = [5136, 5142, 45, 46, 5218, 5240, 5259, 5309, 5370]
        this.buymenu.snipers = [5133, 5118, 5216, 86, 5338, 5241, 5225, 5369, 5244]
        this.buymenu.machineguns = [5125, 5289, 5226, 5332, 5352, 5363, 5311, 5260, 5234]
        this.buymenu.melees = [5353, 5362, 5330, 5303, 5304, 5305, 5365, 5231, 5232]
        this.buymenu.equipment = [36, 37, 23, 4, 8, 34, 0, 0, 0]

        this.loadouts = [
            new UserLoadout(5218, 5288, 84, 4, 23, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
            new UserLoadout(5319, 5131, 5353, 4, 23, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
            new UserLoadout(5220, 5337, 5253, 4, 23, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
        ]

        this.items = []
        this.items = this.getUserInventory().concat(this.getDefaultInventory())
    }

    public getUserInventory(): UserInventoryItem[] {
        const userInv: UserInventoryItem[] = []

        // characters
        for (let i = 1005; i <= 1058; i++) {
            UserInventoryItem.pushItem(userInv, i)
        }

        // unlockable weapons
        const unlockables: number[] = [1, 5, 7, 9, 10, 11, 12, 16, 17, 20, 22, 24, 25, 26, 28, 29, 30, 31, 32, 33]
        for (const unlock of unlockables) {
            UserInventoryItem.pushItem(userInv, unlock)
        }
        for (let i = 44; i <= 163; i++) {
            UserInventoryItem.pushItem(userInv, i)
        }

        // zombie crush skills
        /*for (let i = 2019; i <= 2023; i++) {
            UserInventoryItem.pushItem(userInv, i)
        }*/

        UserInventoryItem.pushItem(userInv, 2019, 3)
        UserInventoryItem.pushItem(userInv, 2020, 50)
        for (let i = 2021; i <= 2023; i++) {
            UserInventoryItem.pushItem(userInv, i)
        }

        // weapon skins
        for (let i = 5042; i <= 5370; i++) {
            UserInventoryItem.pushItem(userInv, i)
        }
        UserInventoryItem.pushItem(userInv, 5997)

        // hats
        for (let i = 10001; i <= 10133; i++) {
            UserInventoryItem.pushItem(userInv, i)
        }

        // backpacks
        for (let i = 20001; i <= 20107; i++) {
            UserInventoryItem.pushItem(userInv, i)
        }

        // gloves
        for (let i = 30001; i <= 30027; i++) {
            UserInventoryItem.pushItem(userInv, i)
        }

        // footsteps
        for (let i = 40001; i <= 40025; i++) {
            UserInventoryItem.pushItem(userInv, i)
        }

        // sprays
        for (let i = 42001; i <= 42020; i++) {
            UserInventoryItem.pushItem(userInv, i)
        }

        // hide props
        for (let i = 49001; i <= 49010; i++) {
            UserInventoryItem.pushItem(userInv, i)
        }
        UserInventoryItem.pushItem(userInv, 49999)

        // cards
        for (let i = 60001; i <= 60004; i++) {
            UserInventoryItem.pushItem(userInv, i)
        }

        return userInv
    }

    public getDefaultInventory(): UserInventoryItem[] {
        const defaultInv: UserInventoryItem[] = []
        const defaults: number[] = [2, 3, 4, 6, 8, 13, 14, 15, 18, 19, 21, 23, 27, 34, 36, 37,
            80, 128, 101, 1001, 1002, 1003, 1004, 49009, 49004]
        for (const def of defaults) {
            UserInventoryItem.pushItem(defaultInv, def)
        }
        return defaultInv
    }

    /**
     * sets a loadout's weapon slot with a different we
     * @param loadout the loadout number
     * @param slot the weapon slot
     * @param itemId the new weapon's item id
     */
    public setLoadoutWeapon(loadout: number, slot: number, itemId: number): void {
        if (loadout > 2) {
            console.warn('UserInventory::setLoadoutWeapon: invalid loadout %i', loadout)
            return
        }

        if (slot > 6) {
            console.warn('UserInventory::setLoadoutWeapon: invalid slot %i', slot)
            return
        }

        this.loadouts[loadout].items[slot] = itemId
    }

    /**
     * sets an user's cosmetic
     * @param slot the cosmetic slot
     * @param itemId the new cosmetic id
     */
    public setCosmetic(slot: number, itemId: number): void {
        // TODO: implement other cosmetics
        switch (slot) {
            case 0:
                this.ctModelItem = itemId
                break
            case 1:
                this.terModelItem = itemId
                break
            case 2:
                this.headItem = itemId
                break
            case 3:
                this.gloveItem = itemId
                break
            case 4:
                this.backItem = itemId
                break
            case 5:
                this.stepsItem = itemId
                break
            case 6:
                this.cardItem = itemId
                break
            case 7:
                this.sprayItem = itemId
                break
            default:
                console.warn('UserInventory::setCosmetic: invalid slot %i', slot)
                break
        }
    }
}
