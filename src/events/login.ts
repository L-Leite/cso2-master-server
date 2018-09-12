import { InLoginPacket } from '../packets/in/login'
import { OutUserInfoPacket } from '../packets/out/userinfo'
import { OutUserStartPacket } from '../packets/out/userstart'

import { PacketId } from '../packets/definitions'
import { UserData } from '../userdata'
import { UserStorage } from '../userstorage'
import { BasePacketEvent } from './base'

let curUserId = 1

/**
 * handles incoming user packets
 * @class OnUserPacket
 */
export class OnLoginPacket extends BasePacketEvent {

    /**
     * get the packet's id we are responsible for
     * @returns returns the id of the packet we handle
     */
    public static packetId(): PacketId {
        return PacketId.Login
    }
    private newUserData: UserData

    /**
     * parses incoming packet's data
     * @returns true if successful, false otherwise
     */
    protected parseInPacket(): boolean {
        const loginPacket: InLoginPacket = new InLoginPacket(this.inData)
        console.log('its a login packet! nexonUsername: ' + loginPacket.nexonUsername
            + ' gameUsername: ' + loginPacket.gameUsername
            + ' password: ' + loginPacket.password
            + ' hddHwid: ' + loginPacket.hddHwid
            + ' netCafeId: ' + loginPacket.netCafeId
            + ' userSn: ' + loginPacket.userSn
            + ' isLeague: ' + loginPacket.isLeague)

        this.newUserData = UserStorage.addUser(
            this.socket, curUserId++, loginPacket.gameUsername)
        return true
    }

    /**
     * builds the reply to be sent to the socket
     * @returns the data to be sent to the socket
     */
    protected buildOutPacket(): Buffer {
        const userStartReply: Buffer = new OutUserStartPacket(
            this.newUserData.userId,
            this.newUserData.userName,
            this.newUserData.userName,
            this.socket.getSeq()).build()

        const userInfoReply: Buffer =
            new OutUserInfoPacket(this.socket.getSeq()).fullUserUpdate(this.newUserData)

        return Buffer.concat([userStartReply, userInfoReply])
    }
}
