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
        this.ctModelItem = 1047
        this.terModelItem = 1048
        this.headItem = 0
        this.gloveItem = 0
        this.backItem = 0
        this.stepsItem = 0
        this.sprayItem = 42001

        this.buymenu = new UserBuyMenu()
        this.buymenu.pistols = [5280, 5279, 5337, 5356, 5294, 5360, 5262, 103, 106]
        this.buymenu.shotguns = [5130, 5293, 5306, 5261, 5242, 5264, 5265, 5230, 137]
        this.buymenu.smgs = [5251, 5295, 5238, 5320, 5285, 5347, 5310, 162, 105]
        this.buymenu.rifles = [46, 45, 5296, 5184, 5355, 113, 102, 161, 157]
        this.buymenu.snipers = [5133, 5118, 5206, 5241, 5225, 146, 125, 160, 163]
        this.buymenu.machineguns = [5125, 5314, 5260, 87, 5332, 5366, 5276, 5233, 159]
        this.buymenu.melees = [79, 5232, 84, 5221, 5304, 5330, 5253, 5231, 5353]
        this.buymenu.equipment = [36, 37, 23, 4, 8, 34, 0, 0, 0]

        this.loadouts = [
            new UserLoadout(5336, 5356, 5330, 4, 23, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
            new UserLoadout(5285, 5294, 5231, 4, 23, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
            new UserLoadout(5206, 5356, 5365, 4, 23, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
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
            if (this.BlockItems(i)) {
              continue
            }
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
            if (this.BlockItems(i)) {
              continue
            }
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

    // block something that shouldn't be there
    // (not including weapon skins, decorations, etc can be fix on client)
    public BlockItems(id: number): boolean {
        switch (id) {
            case 56:
            case 58:
            case 69:
            case 107:
            case 117:
            case 134:
            case 139:
            case 5172:
            case 5173:
            case 5174:
            case 5227:
            case 5228:
            case 5229:
              return true
            default:
            return false
        }
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

