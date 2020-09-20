import { ExtendedSocket } from 'extendedsocket'

import {
    AboutmePacketType,
    AboutmeCampaignUpdateType,
    IsMissionCampaignIdValid
} from 'packets/definitions'

import { InAboutmePacket } from 'packets/in/aboutme'
import { InAboutmeCampaignUpdate } from 'packets/in/aboutme/campaigncomplete'
import { InAboutmeSetAvatar } from 'packets/in/aboutme/avatar'
import { InAboutmeSetSignature } from 'packets/in/aboutme/signature'
import { InAboutmeSetTitle } from 'packets/in/aboutme/title'

import { OutUserInfoPacket } from 'packets/out/userinfo'

import { Room } from 'room/room'
import { UserSession } from 'user/usersession'
import { UserService } from 'services/userservice'

/**
 * handles incoming AboutMe type packets
 */
export class AboutMeHandler {
    /* constructor() {} */

    public async OnPacket(
        packetData: Buffer,
        connection: ExtendedSocket
    ): Promise<boolean> {
        const aboutPacket: InAboutmePacket = new InAboutmePacket(packetData)

        if (connection.session == null) {
            console.warn(
                `connection ${connection.uuid} sent an AboutMe packet without a session`
            )
            return false
        }

        switch (aboutPacket.packetType) {
            case AboutmePacketType.CampaignUpdate:
                return this.OnCampaignUpdate(aboutPacket, connection)
            case AboutmePacketType.SetAvatar:
                return this.OnSetAvatar(aboutPacket, connection)
            case AboutmePacketType.SetSignature:
                return this.OnSetSignature(aboutPacket, connection)
            case AboutmePacketType.SetTitle:
                return this.OnSetTitle(aboutPacket, connection)
        }

        console.warn(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `AboutMeHandler::OnPacket: unknown packet type ${aboutPacket.packetType}`
        )

        return false
    }

    private async OnCampaignUpdate(
        aboutPkt: InAboutmePacket,
        conn: ExtendedSocket
    ): Promise<boolean> {
        const campaignData = new InAboutmeCampaignUpdate(aboutPkt)

        const user = conn.session.user

        switch (campaignData.type) {
            case AboutmeCampaignUpdateType.Started:
                console.debug(`user ${user.id} sent a campaign started packet`)
                return true

            default:
                return this.OnCampaignFinished(campaignData, conn)
        }

        console.warn(
            `user ${user.id} sent an invalid campaign update request type ${campaignData.type}`
        )

        return false
    }

    private async OnCampaignFinished(
        campaignData: InAboutmeCampaignUpdate,
        conn: ExtendedSocket
    ): Promise<boolean> {
        const user = conn.session.user
        const campaignId = campaignData.campaignId

        if (IsMissionCampaignIdValid(campaignId) === false) {
            console.warn(
                `user ${user.id} sent an invalid campaign complete request for ${campaignId}`
            )
            return false
        }

        const newFlags = user.campaign_flags | campaignId
        const updated = await UserService.UpdatePartial(
            {
                campaign_flags: newFlags
            },
            user.id
        )

        if (updated === false) {
            console.warn(
                `Failed to update user ${user.id}'s campaign flags to ${newFlags}`
            )
            return false
        }

        const updateInfoPkt = OutUserInfoPacket.updateCampaignFlags(user)
        conn.send(updateInfoPkt)

        console.debug(`Setting user ${user.id}'s campaign flags to ${newFlags}`)

        return true
    }

    private async OnSetAvatar(
        aboutPkt: InAboutmePacket,
        conn: ExtendedSocket
    ): Promise<boolean> {
        const avatarData: InAboutmeSetAvatar = new InAboutmeSetAvatar(aboutPkt)

        const session: UserSession = conn.session
        const updated: boolean = await UserService.UpdatePartial(
            {
                avatar: avatarData.avatarId
            },
            session.user.id
        )

        if (updated === false) {
            console.warn(
                `Failed to update user ${session.user.id}'s avatar to ${avatarData.avatarId}`
            )
            return false
        }

        const newPacket: OutUserInfoPacket = OutUserInfoPacket.updateAvatar(
            session.user
        )

        conn.send(newPacket)

        if (session.isInRoom() === true) {
            const curRoom: Room = session.currentRoom
            curRoom.recurseUsers((u) => {
                if (u.conn !== conn) {
                    u.conn.send(newPacket)
                }
            })
        }

        console.log(
            `Setting user ID ${session.user.id}'s avatar to ${avatarData.avatarId}`
        )

        return true
    }

    private async OnSetSignature(
        aboutPkt: InAboutmePacket,
        conn: ExtendedSocket
    ): Promise<boolean> {
        const signatureData: InAboutmeSetSignature = new InAboutmeSetSignature(
            aboutPkt
        )

        const session: UserSession = conn.session

        if (signatureData.msg == null) {
            console.warn(`null signature requested to be set by ${conn.uuid}`)
            return false
        }

        const updated: boolean = await UserService.UpdatePartial(
            {
                signature: signatureData.msg
            },
            session.user.id
        )

        if (updated === false) {
            console.warn(`Failed to update user ${session.user.id}'s signature`)
            return false
        }

        const newPacket: OutUserInfoPacket = OutUserInfoPacket.updateSignature(
            session.user
        )

        conn.send(newPacket)

        if (session.isInRoom() === true) {
            const curRoom: Room = session.currentRoom
            curRoom.recurseUsers((u) => {
                if (u.conn !== conn) {
                    u.conn.send(newPacket)
                }
            })
        }

        console.log(
            `Setting user ID ${session.user.id}'s signature "${signatureData.msg}"`
        )

        return true
    }

    private async OnSetTitle(
        aboutPkt: InAboutmePacket,
        conn: ExtendedSocket
    ): Promise<boolean> {
        const titleData: InAboutmeSetTitle = new InAboutmeSetTitle(aboutPkt)

        const session: UserSession = conn.session

        if (titleData.titleId == null) {
            console.warn(`null title requested to be set by ${conn.uuid}`)
            return false
        }

        const updated: boolean = await UserService.UpdatePartial(
            {
                title: titleData.titleId
            },
            session.user.id
        )

        if (updated === false) {
            console.warn(
                `Failed to update user ${session.user.id}'s title to ${titleData.titleId}`
            )
            return false
        }

        const newPacket: OutUserInfoPacket = OutUserInfoPacket.updateTitle(
            session.user
        )

        conn.send(newPacket)

        if (session.isInRoom() === true) {
            const curRoom: Room = session.currentRoom
            curRoom.recurseUsers((u) => {
                if (u.conn !== conn) {
                    u.conn.send(newPacket)
                }
            })
        }

        console.log(
            `Setting user ID ${session.user.id}'s title to ${titleData.titleId}`
        )

        return true
    }
}
