import { ExtendedSocket } from 'extendedsocket'

import { AboutmePacketType } from 'packets/definitions'

import { InAboutmePacket } from 'packets/in/aboutme'
import { InAboutmeSetAvatar } from 'packets/in/aboutme/avatar'
import { InAboutmeSetSignature } from 'packets/in/aboutme/signature'
import { InAboutmeSetTitle } from 'packets/in/aboutme/title'

import { OutUserInfoPacket } from 'packets/out/userinfo'

import { UserService } from 'services/userservice'

import { Room } from 'room/room'
import { UserSession } from 'user/usersession'

/**
 * handles incoming AboutMe type packets
 */
export class AboutMeHandler {
    private userSvc: UserService

    constructor(userSvc: UserService) {
        this.userSvc = userSvc
    }

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

    private async OnSetAvatar(
        aboutPkt: InAboutmePacket,
        conn: ExtendedSocket
    ): Promise<boolean> {
        const avatarData: InAboutmeSetAvatar = new InAboutmeSetAvatar(aboutPkt)

        const session: UserSession = conn.session
        const updated: boolean = await this.userSvc.SetUserAvatar(
            session.user,
            avatarData.avatarId
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

        const updated: boolean = await this.userSvc.SetUserSignature(
            session.user,
            signatureData.msg
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

        const updated: boolean = await this.userSvc.SetUserTitle(
            session.user,
            titleData.titleId
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
