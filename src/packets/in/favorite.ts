import { InPacketBase } from 'packets/in/packet'

import { FavoritePacketType } from 'packets/definitions'

/**
 * incoming favorite packet
 * @class InFavoritePacket
 */
export class InFavoritePacket extends InPacketBase {
    public packetType: FavoritePacketType

    /**
     * parses the packet's data
     */
    protected parse(): void {
        super.parse()

        this.packetType = this.readUInt8()
    }
}
