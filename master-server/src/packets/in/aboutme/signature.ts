import { InPacketBase } from 'packets/in/packet'

/**
 * request to set an user's status message
 */
export class InAboutmeSetSignature {
    public msg: string

    constructor(inPacket: InPacketBase) {
        this.msg = inPacket.readString()
    }
}
