import { InPacketBase } from 'packets/in/packet'

/**
 * incoming request of an user's campaign status
 */
export class InAchievementRequestCampaignStatus {
    public unk: number

    constructor(inPacket: InPacketBase) {
        this.unk = inPacket.readUInt16()
    }
}
