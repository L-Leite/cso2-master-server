import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { UserLoadout } from 'user/userloadout'

import { FavoritePacketType } from 'packets/favoriteshared'

import { OutFavoriteCosmetics } from 'packets/out/favorite/cosmetics'
import { OutFavoritePresetLoadout } from 'packets/out/favorite/presetloadout'

/**
 * outgoing room information
 * @class OutFavoritePacket
 */
export class OutFavoritePacket extends OutPacketBase {

    public static setCosmetics(ctModelItem: number, terModelItem: number, headItem: number,
                               gloveItem: number, backItem: number, stepsItem: number,
                               cardItem: number, sprayItem: number): OutFavoritePacket {
        const packet: OutFavoritePacket = new OutFavoritePacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 40, incrementAmount: 15 })

        packet.buildHeader()
        packet.writeUInt8(FavoritePacketType.SetCosmetics)

        OutFavoriteCosmetics.build(ctModelItem, terModelItem, headItem, gloveItem, backItem,
            stepsItem, cardItem, sprayItem, packet)

        return packet
    }

    public static setLoadout(loadout: UserLoadout[]): OutFavoritePacket {
        const packet: OutFavoritePacket = new OutFavoritePacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 40, incrementAmount: 15 })

        packet.buildHeader()
        packet.writeUInt8(FavoritePacketType.SetLoadout)

        OutFavoritePresetLoadout.build(loadout, packet)

        return packet
    }
    constructor() {
        super(PacketId.Favorite)
    }
 }
