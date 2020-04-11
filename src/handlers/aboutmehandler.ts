import { ExtendedSocket } from 'extendedsocket'

import { AboutmePacketType } from 'packets/aboutmeshared'

import { InAboutmePacket } from 'packets/in/aboutme'
import { InAboutmeSetAvatar } from 'packets/in/aboutme/avatar'
import { InAboutmeSetSignature } from 'packets/in/aboutme/signature'
import { InAboutmeSetTitle } from 'packets/in/aboutme/title'

import { OutUserInfoPacket } from 'packets/out/userinfo'

import { UserService } from 'services/userservice'

import { UserSession } from 'user/usersession'

/**
 * handles incoming AboutMe type packets
 */
export class AboutMeHandler {
  private userSvc: UserService

  constructor(userSvc: UserService) {
    this.userSvc = userSvc
  }

  public async OnPacket(packetData: Buffer, connection: ExtendedSocket): Promise<boolean> {
    const aboutPacket: InAboutmePacket = new InAboutmePacket(packetData)

    if (connection.hasSession() === false) {
      console.warn(`connection ${connection.uuid} sent an AboutMe packet without a session`)
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

    console.warn(`AboutMeHandler::OnPacket: unknown packet type ${aboutPacket.packetType}`)

    return false
  }

  private async OnSetAvatar(aboutPkt: InAboutmePacket, conn: ExtendedSocket): Promise<boolean> {
    const avatarData: InAboutmeSetAvatar = new InAboutmeSetAvatar(aboutPkt)

    const session: UserSession = conn.getSession()
    const updated: boolean = await this.userSvc.SetUserAvatar(session.user, avatarData.avatarId)

    if (updated === false) {
      console.warn(`Failed to update user ${session.user.userId}'s avatar to ${avatarData.avatarId}`)
      return false;
    }

    conn.send(OutUserInfoPacket.updateAvatar(session.user))

    console.log(`Setting user ID ${session.user.userId}'s avatar to ${avatarData.avatarId}`)

    return true
  }

  private async OnSetSignature(aboutPkt: InAboutmePacket, conn: ExtendedSocket): Promise<boolean> {
    const signatureData: InAboutmeSetSignature = new InAboutmeSetSignature(aboutPkt)

    const session: UserSession = conn.getSession()

    if (signatureData.msg == null) {
      console.warn(`null signature requested to be set by ${conn.uuid}`)
      return false;
    }

    const updated: boolean  = await this.userSvc.SetUserSignature(session.user, signatureData.msg)

    if (updated === false) {
      console.warn(`Failed to update user ${session.user.userId}'s signature`)
      return false;
    }

    conn.send(OutUserInfoPacket.updateSignature(session.user))

    console.log(`Setting user ID ${session.user.userId}'s signature`)

    return true
  }

  private async OnSetTitle(aboutPkt: InAboutmePacket, conn: ExtendedSocket): Promise<boolean> {
    const titleData: InAboutmeSetTitle = new InAboutmeSetTitle(aboutPkt)

    const session: UserSession = conn.getSession()

    if (titleData.titleId == null) {
      console.warn(`null title requested to be set by ${conn.uuid}`)
      return false;
    }

    const updated: boolean  = await this.userSvc.SetUserTitle(session.user, titleData.titleId)

    if (updated === false) {
      console.warn(`Failed to update user ${session.user.userId}'s title to ${titleData.titleId}`)
      return false;
    }

    conn.send(OutUserInfoPacket.updateTitle(session.user))

    console.log(`Setting user ID ${session.user.userId}'s title to ${titleData.titleId}`)

    return true
  }
}
