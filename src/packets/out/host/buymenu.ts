import { OutPacketBase } from 'packets/out/packet'

import { UserBuyMenu } from 'user/userbuymenu'

import { OutOptionBuySubMenu } from '../option/buysubmenu'

/**
 * sends an user's buy menu to a host
 * @class OutHostPreloadInventory
 */
export class OutHostBuyMenu {
    private userId: number
    private buyMenuByteLength: number
    private unk00: number
    private submenues: OutOptionBuySubMenu[]

    constructor(userId: number, buymenu: UserBuyMenu) {
        this.userId = userId
        this.buyMenuByteLength = 369

        this.unk00 = 0

        this.submenues = [
            new OutOptionBuySubMenu(buymenu.pistols), // pistols
            new OutOptionBuySubMenu(buymenu.shotguns), // shotguns
            new OutOptionBuySubMenu(buymenu.smgs), // smgs
            new OutOptionBuySubMenu(buymenu.rifles), // rifles
            new OutOptionBuySubMenu(buymenu.snipers), // snipers
            new OutOptionBuySubMenu(buymenu.machineguns), // machine guns
            new OutOptionBuySubMenu(buymenu.melees), // melee weapons
            new OutOptionBuySubMenu(buymenu.equipment), // equipment
        ]
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt32(this.userId)
        outPacket.writeUInt16(this.buyMenuByteLength)
        outPacket.writeUInt8(this.unk00)

        for (const submenu of this.submenues) {
            submenu.build(outPacket)
        }
    }
}
