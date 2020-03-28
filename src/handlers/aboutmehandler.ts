import { ExtendedSocket } from 'extendedsocket'

import { AboutmePacketType } from 'packets/aboutmeshared'

import { InAboutmePacket } from 'packets/in/aboutme'
import { InAboutmeSetAvatar } from 'packets/in/aboutme/avatar'
import { InAboutmeSetSignature } from 'packets/in/aboutme/signature'
import { InAboutmeSetTitle } from 'packets/in/aboutme/title'

import { OutUserInfoPacket } from 'packets/out/userinfo'

import { UserService } from 'services/userservice'

import { User } from 'user/user'

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

    if (connection.hasOwner() === false) {
      console.warn(`connection ${connection.uuid} sent a host packet without a session`)
      return false
    }

    const user: User = connection.getOwner()

    if (user == null) {
      console.error(`couldn't get user from connection ${connection.uuid}`)
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

    let user: User = conn.getOwner()

    if (user == null) {
      console.error(`couldn't get user from connection ${conn.uuid}`)
      return false
    }

    user = await this.userSvc.SetUserAvatar(user, avatarData.avatarId)

    if (user == null) {
      console.warn(`Failed to update user ${user.userId}'s avatar to ${avatarData.avatarId}`)
      return false;
    }

    conn.send(OutUserInfoPacket.updateAvatar(user))

    console.log(`Setting user ID ${user.userId}'s avatar to ${avatarData.avatarId}`)

    return true
  }

  private async OnSetSignature(aboutPkt: InAboutmePacket, conn: ExtendedSocket): Promise<boolean> {
    const signatureData: InAboutmeSetSignature = new InAboutmeSetSignature(aboutPkt)

    let user: User = conn.getOwner()

    if (user == null) {
      console.error(`couldn't get user from connection ${conn.uuid}`)
      return false
    }

    if (signatureData.msg == null) {
      console.warn(`null signature requested to be set by ${conn.uuid}`)
      return false;
    }

    user = await this.userSvc.SetUserSignature(user, signatureData.msg)

    if (user == null) {
      console.warn(`Failed to update user ${user.userId}'s signature`)
      return false;
    }

    conn.send(OutUserInfoPacket.updateSignature(user))

    console.log(`Setting user ID ${user.userId}'s signature`)

    return true
  }

  private async OnSetTitle(aboutPkt: InAboutmePacket, conn: ExtendedSocket): Promise<boolean> {
    const titleData: InAboutmeSetTitle = new InAboutmeSetTitle(aboutPkt)

    let user: User = conn.getOwner()

    if (user == null) {
      console.error(`couldn't get user from connection ${conn.uuid}`)
      return false
    }

    if (titleData.titleId == null) {
      console.warn(`null title requested to be set by ${conn.uuid}`)
      return false;
    }

    user = await this.userSvc.SetUserTitle(user, titleData.titleId)

    if (user == null) {
      console.warn(`Failed to update user ${user.userId}'s title to ${titleData.titleId}`)
      return false;
    }

    conn.send(OutUserInfoPacket.updateTitle(user))

    console.log(`Setting user ID ${user.userId}'s title to ${titleData.titleId}`)

    return true
  }
}
