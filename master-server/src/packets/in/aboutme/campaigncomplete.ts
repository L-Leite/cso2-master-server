import { InPacketBase } from 'packets/in/packet'

import { AboutmeCampaignUpdateType } from 'packets/definitions'

/**
 * received when a campaign mission related action happens
 */
export class InAboutmeCampaignUpdate {
    public type: AboutmeCampaignUpdateType
    public campaignId: number

    constructor(inPacket: InPacketBase) {
        this.type = inPacket.readUInt8()

        if (this.type === AboutmeCampaignUpdateType.Finished) {
            this.campaignId = inPacket.readUInt16()
        }
    }
}
