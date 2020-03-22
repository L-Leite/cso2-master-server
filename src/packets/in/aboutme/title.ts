import { InPacketBase } from 'packets/in/packet'

/**
 * request to set an user's title (from a titles list)
 */
export class InAboutmeSetTitle {
    public titleId: number

    constructor(inPacket: InPacketBase) {
        this.titleId = inPacket.readUInt16()
    }
}
