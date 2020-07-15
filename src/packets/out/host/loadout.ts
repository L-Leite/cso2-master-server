import { OutPacketBase } from 'packets/out/packet'

import { UserCosmetics } from 'user/usercosmetics'
import { UserLoadout } from 'user/userloadout'

/**
 * sends an user's loadout to a host
 * @class OutHostPreloadInventory
 */
export class OutHostLoadout {
    public static build(userId: number, cosmetics: UserCosmetics,
                        loadouts: UserLoadout[], outPacket: OutPacketBase): void {
        outPacket.writeUInt32(userId)
        outPacket.writeUInt8(8) // num of cosmetics

        let curItem: number = 0

        this.writeItem(cosmetics.ct_item, curItem++, outPacket)
        this.writeItem(cosmetics.ter_item, curItem++, outPacket)
        this.writeItem(cosmetics.head_item, curItem++, outPacket)
        this.writeItem(cosmetics.glove_item, curItem++, outPacket)
        this.writeItem(cosmetics.back_item, curItem++, outPacket)
        this.writeItem(cosmetics.steps_item, curItem++, outPacket)
        this.writeItem(cosmetics.card_item, curItem++, outPacket)
        this.writeItem(cosmetics.spray_item, curItem++, outPacket)

        outPacket.writeUInt8(3) // numOfLoadouts

        for (const loadout of loadouts) {
            outPacket.writeInt8(16) // num of loadout slots
            curItem = 0

            this.writeItem(loadout.primary_weapon, curItem++, outPacket)
            this.writeItem(loadout.secondary_weapon, curItem++, outPacket)
            this.writeItem(loadout.melee, curItem++, outPacket)
            this.writeItem(loadout.hegrenade, curItem++, outPacket)
            this.writeItem(loadout.smoke, curItem++, outPacket)
            this.writeItem(loadout.flash, curItem++, outPacket)
            // TODO: do we need this?
            while (curItem < 16) {
                this.writeItem(0, curItem++, outPacket)
            }
        }

        outPacket.writeUInt8(0) // unk00
    }

    private static writeItem(itemNum: number, curItem: number, outPacket: OutPacketBase): void {
        outPacket.writeUInt8(curItem)
        outPacket.writeUInt32(itemNum)
    }
}
