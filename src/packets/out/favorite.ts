import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { ExtendedSocket } from 'extendedsocket'

import { UserLoadout } from 'user/userloadout'

import { FavoritePacketType } from 'packets/favoriteshared'

import { OutFavoriteCosmetics } from 'packets/out/favorite/cosmetics'
import { OutFavoritePresetLoadout } from 'packets/out/favorite/presetloadout'

/**
 * outgoing room information
 * @class OutFavoritePacket
 */
export class OutFavoritePacket extends OutPacketBase {
    constructor(socket: ExtendedSocket) {
        super(socket, PacketId.Favorite)
    }

    public setCosmetics(ctModelItem: number, terModelItem: number, headItem: number,
                        gloveItem: number, backItem: number, stepsItem: number,
                        cardItem: number, sprayItem: number): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 40, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(FavoritePacketType.SetCosmetics)

        new OutFavoriteCosmetics(ctModelItem, terModelItem,
            headItem, gloveItem, backItem, stepsItem, cardItem, sprayItem).build(this)

        return this.getData()
    }

    public setLoadout(loadout: UserLoadout[]): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 40, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(FavoritePacketType.SetLoadout)

        new OutFavoritePresetLoadout(loadout).build(this)

        return this.getData()
    }
}
