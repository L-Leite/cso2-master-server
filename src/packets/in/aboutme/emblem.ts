import { InPacketBase } from 'packets/in/packet'

/**
 * request to set an user's emblem (unlocked through achievements)
 */
export class InAboutmeSetEmblem {
    public emblemId: number

    constructor(inPacket: InPacketBase) {
        this.emblemId = inPacket.readUInt16()
    }
}
