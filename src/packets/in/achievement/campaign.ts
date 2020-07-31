import { InPacketBase } from 'packets/in/packet'
import { MissionCampaignIds } from 'packets/definitions'

/**
 * incoming request of an user's campaign status
 */
export class InAchievementGetCampaignData {
    public campaignId: MissionCampaignIds

    constructor(inPacket: InPacketBase) {
        this.campaignId = inPacket.readUInt16()
    }
}
