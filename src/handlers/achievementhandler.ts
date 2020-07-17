import { ExtendedSocket } from 'extendedsocket'

import { AchievementPacketType } from 'packets/definitions'
import { InAchievementPacket } from 'packets/in/achievement'
import { OutAchievementPacket } from 'packets/out/achievement'

const ACHIEVEMENT_CAMPAIGNS_COUNT = 6

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
                return this.HandleCampaignRequest(conn)
        }

        console.warn(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `AchievementHandler::OnPacket: unknown packet type ${achPacket.packetType}`
        )

        return false
    }

    private HandleCampaignRequest(conn: ExtendedSocket): boolean {
        for (let i = 0; i < ACHIEVEMENT_CAMPAIGNS_COUNT; i++) {
            conn.send(OutAchievementPacket.UpdateCampaign(i))
        }

        return true
    }
}
