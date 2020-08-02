import { InPacketBase } from 'packets/in/packet'

/**
 * requests an user's loadout
 * @class InHostSetLoadout
 */
export class InHostSetLoadout {
    public userId: number

    constructor(inPacket: InPacketBase) {
        this.userId = inPacket.readUInt32()
    }
}
