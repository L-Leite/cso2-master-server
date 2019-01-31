import { OutPacketBase } from 'packets/out/packet'

import { OutOptionBuySubMenu } from 'packets/out/option/buysubmenu'

import { UserBuyMenu } from 'user/userbuymenu'

/**
 * @class OutOptionBuyMenu
 */
export class OutOptionBuyMenu {

    private buyMenuByteLength: number
    private unk00: number
    private submenues: OutOptionBuySubMenu[]

    constructor(buymenu: UserBuyMenu) {
        this.buyMenuByteLength = 369

        this.unk00 = 2

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
        outPacket = outPacket

        outPacket.writeUInt16(this.buyMenuByteLength)
        outPacket.writeUInt8(this.unk00)

        for (const submenu of this.submenues) {
            submenu.build(outPacket)
        }
    }
}
