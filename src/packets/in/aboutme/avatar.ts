import { InPacketBase } from 'packets/in/packet'

/**
 * request to set an user's avatar
 */
export class InAboutmeSetAvatar {
    public avatarId: number

    constructor(inPacket: InPacketBase) {
        this.avatarId = inPacket.readUInt16()
    }
}
