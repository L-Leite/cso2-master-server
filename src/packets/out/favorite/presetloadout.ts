import { OutPacketBase } from 'packets/out/packet'

import { OutFavoriteBaseLoadout } from 'packets/out/favorite/baseloadout'

import { UserLoadout } from 'user/userloadout'

/**
 * @class OutFavoriteSomeLoadout
 */
export class OutFavoritePresetLoadout {
    private loadouts: OutFavoriteBaseLoadout[]

    constructor(loadout: UserLoadout[]) {
        this.loadouts = [
            new OutFavoriteBaseLoadout(0, loadout[0].items),
            new OutFavoriteBaseLoadout(1, loadout[1].items),
            new OutFavoriteBaseLoadout(2, loadout[2].items),
        ]
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt8(this.loadouts.length * 16) // the ammount of items being sent

        for (const loadout of this.loadouts) {
            loadout.write(outPacket)
        }
    }
}
