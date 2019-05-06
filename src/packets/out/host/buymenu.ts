import { OutPacketBase } from 'packets/out/packet'

import { UserBuyMenu } from 'user/userbuymenu'

/**
 * sends an user's buy menu to a host
 * @class OutHostPreloadInventory
 */
export class OutHostBuyMenu {
    public static build(userId: number, buymenu: UserBuyMenu, outPacket: OutPacketBase): void {
        outPacket.writeUInt32(userId)
        outPacket.writeUInt16(369) // buy menu's byte length
        outPacket.writeUInt8(0) // unk00

        this.buildSubmenu(buymenu.pistols, outPacket)
        this.buildSubmenu(buymenu.shotguns, outPacket)
        this.buildSubmenu(buymenu.smgs, outPacket)
        this.buildSubmenu(buymenu.rifles, outPacket)
        this.buildSubmenu(buymenu.snipers, outPacket)
        this.buildSubmenu(buymenu.machineguns, outPacket)
        this.buildSubmenu(buymenu.melees, outPacket)
        this.buildSubmenu(buymenu.equipment, outPacket)
    }

    public static buildSubmenu(items: number[], outPacket: OutPacketBase): void {
        let curItem: number = 0

        outPacket.writeUInt8(items.length) // number of items in the submenu
        for (const item of items) {
            outPacket.writeUInt8(curItem++)
            outPacket.writeUInt32(item)
        }
    }
}
