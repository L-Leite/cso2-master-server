import { OutPacketBase } from 'packets/out/packet'

import { UserBuyMenu } from 'user/userbuymenu'

/**
 * @class OutOptionBuyMenu
 */
export class OutOptionBuyMenu {
    public static build(buyMenu: UserBuyMenu, outPacket: OutPacketBase): void {
        outPacket.writeUInt16(369) // buy menu byte length
        outPacket.writeUInt8(2) // unk00

        this.buildSubmenu(buyMenu.pistols, outPacket)
        this.buildSubmenu(buyMenu.shotguns, outPacket)
        this.buildSubmenu(buyMenu.smgs, outPacket)
        this.buildSubmenu(buyMenu.rifles, outPacket)
        this.buildSubmenu(buyMenu.snipers, outPacket)
        this.buildSubmenu(buyMenu.machineguns, outPacket)
        this.buildSubmenu(buyMenu.melees, outPacket)
        this.buildSubmenu(buyMenu.equipment, outPacket)
    }

    public static buildSubmenu(
        items: number[],
        outPacket: OutPacketBase
    ): void {
        let curItem = 0

        outPacket.writeUInt8(items.length) // number of items in the submenu
        for (const item of items) {
            outPacket.writeUInt8(curItem++)
            outPacket.writeUInt32(item)
        }
    }
}
