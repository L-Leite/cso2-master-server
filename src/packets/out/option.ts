import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { ExtendedSocket } from 'extendedsocket'

import { OutOptionBuyMenu } from 'packets/out/option/buymenu'

import { UserBuyMenu } from 'user/userbuymenu'

enum OutOptionPacketType {
    SetBuyMenu = 1,
}

/**
 * outgoing room information
 * @class OutOptionPacket
 */
export class OutOptionPacket extends OutPacketBase {
    constructor(socket: ExtendedSocket) {
        super(socket, PacketId.Option)
    }

    public setBuyMenu(buymenu: UserBuyMenu): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 40, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutOptionPacketType.SetBuyMenu)

        new OutOptionBuyMenu(buymenu).build(this)

        return this.getData()
    }
}
