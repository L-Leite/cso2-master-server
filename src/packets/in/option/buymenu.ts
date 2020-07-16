import { InPacketBase } from 'packets/in/packet'

import { UserBuyMenu } from 'user/userbuymenu'

const SUBMENU_ITEM_NUM = 9 // the ammount of items in a sub buy menu

/**
 * parses an user defined buy menu
 */
export class InOptionBuyMenu {
    public menuByteLength: number
    public unk00: number
    public buyMenu: UserBuyMenu

    constructor(inPacket: InPacketBase) {
        this.menuByteLength = inPacket.readUInt16()
        this.unk00 = inPacket.readUInt8()

        this.buyMenu = {
            pistols: this.readSubmenu(inPacket),
            shotguns: this.readSubmenu(inPacket),
            smgs: this.readSubmenu(inPacket),
            rifles: this.readSubmenu(inPacket),
            snipers: this.readSubmenu(inPacket),
            machineguns: this.readSubmenu(inPacket),
            melees: this.readSubmenu(inPacket),
            equipment: this.readSubmenu(inPacket)
        }
    }

    private readSubmenu(inPacket: InPacketBase): number[] {
        const submenuLen: number = inPacket.readUInt8()

        if (submenuLen !== SUBMENU_ITEM_NUM) {
            throw new Error(
                `The sub menu's length is different. Actual len: ${submenuLen}`
            )
        }

        const items: number[] = []

        for (let i = 0; i < SUBMENU_ITEM_NUM; i++) {
            const curItem: number = inPacket.readUInt8()

            if (curItem !== i) {
                throw new Error(
                    `The current sub buy menu index is different from the expected. curItem: ${curItem} i: ${i}`
                )
            }

            items.push(inPacket.readUInt32())
        }

        return items
    }
}
