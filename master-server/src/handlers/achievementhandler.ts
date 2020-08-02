import { ExtendedSocket } from 'extendedsocket'

import { AchievementPacketType, MissionCampaignIds } from 'packets/definitions'
import { InAchievementPacket } from 'packets/in/achievement'
import { OutAchievementPacket } from 'packets/out/achievement'
import { InAchievementGetCampaignData } from 'packets/in/achievement/campaign'

export class AchievementHandler {
    public OnPacket(packetData: Buffer, conn: ExtendedSocket): boolean {
        const achPacket = new InAchievementPacket(packetData)

        if (conn.session == null) {
            console.warn(
                `connection ${conn.uuid} sent an AboutMe packet without a session`
            )
            return false
        }

        switch (achPacket.packetType) {
            case AchievementPacketType.Campaign:
                return this.HandleCampaignRequest(achPacket, conn)
        }

        console.warn(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `AchievementHandler::OnPacket: unknown packet type ${achPacket.packetType}`
        )

        return false
    }

    private HandleCampaignRequest(
        achPacket: InAchievementPacket,
        conn: ExtendedSocket
    ): boolean {
        const campaignPkt = new InAchievementGetCampaignData(achPacket)

        switch (campaignPkt.campaignId) {
            case MissionCampaignIds.Campaign_0:
                conn.send(
                    OutAchievementPacket.UpdateCampaign(
                        MissionCampaignIds.Campaign_0
                    )
                )
                break

            case MissionCampaignIds.Campaign_1:
                conn.send(
                    OutAchievementPacket.UpdateCampaign(
                        MissionCampaignIds.Campaign_1,
                        {
                            rewardXp: 3000
                        }
                    )
                )
                break

            case MissionCampaignIds.Campaign_2:
                conn.send(
                    OutAchievementPacket.UpdateCampaign(
                        MissionCampaignIds.Campaign_2,
                        {
                            rewardPoints: 5000
                        }
                    )
                )
                break

            case MissionCampaignIds.Campaign_3:
                conn.send(
                    OutAchievementPacket.UpdateCampaign(
                        MissionCampaignIds.Campaign_3,
                        {
                            rewardIcon: 24
                        }
                    )
                )
                break

            case MissionCampaignIds.Campaign_4:
                conn.send(
                    OutAchievementPacket.UpdateCampaign(
                        MissionCampaignIds.Campaign_4,
                        {
                            rewardItems: [
                                {
                                    itemId: 1002,
                                    ammount: 1,
                                    timeLimited: false
                                },
                                { itemId: 1004, ammount: 1, timeLimited: false }
                            ]
                        }
                    )
                )
                break

            case MissionCampaignIds.Campaign_5:
                conn.send(
                    OutAchievementPacket.UpdateCampaign(
                        MissionCampaignIds.Campaign_5,
                        {
                            rewardItems: [
                                { itemId: 54, ammount: 1, timeLimited: false },
                                { itemId: 55, ammount: 1, timeLimited: false }
                            ]
                        }
                    )
                )
                break

            case MissionCampaignIds.Campaign_6:
                // unused
                break

            default:
                console.error(
                    `Got invalid campaign mission id ${campaignPkt.campaignId}`
                )
                return false
        }

        return true
    }
}
