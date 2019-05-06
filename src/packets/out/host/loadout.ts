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

        this.writeItem(cosmetics.ctItem, curItem++, outPacket)
        this.writeItem(cosmetics.terItem, curItem++, outPacket)
        this.writeItem(cosmetics.headItem, curItem++, outPacket)
        this.writeItem(cosmetics.gloveItem, curItem++, outPacket)
        this.writeItem(cosmetics.backItem, curItem++, outPacket)
        this.writeItem(cosmetics.stepsItem, curItem++, outPacket)
        this.writeItem(cosmetics.cardItem, curItem++, outPacket)
        this.writeItem(cosmetics.sprayItem, curItem++, outPacket)

        outPacket.writeUInt8(3) // numOfLoadouts

        for (const loadout of loadouts) {
            outPacket.writeInt8(16) // num of loadout slots
            curItem = 0

            this.writeItem(loadout.primary, curItem++, outPacket)
            this.writeItem(loadout.secondary, curItem++, outPacket)
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
