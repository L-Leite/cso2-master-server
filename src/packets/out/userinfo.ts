import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { User } from 'user/user'

import { UserInfoFullUpdate } from 'packets/out/userinfo/fulluserupdate'

import { ExtendedSocket } from 'extendedsocket'

/**
 * outgoing userinfo packet
 * @class OutUserInfoPacket
 */
export class OutUserInfoPacket extends OutPacketBase {
    constructor(socket: ExtendedSocket) {
        super(socket, PacketId.UserInfo)
    }

    public fullUserUpdate(user: User): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 100, incrementAmount: 20 })

        this.buildHeader()
        this.writeUInt32(user.userId)

        new UserInfoFullUpdate(user).build(this)

        return this.getData()
    }
}
