import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { User } from 'user/user'

import { UserInfoFullUpdate } from 'packets/out/userinfo/fulluserupdate'

/**
 * outgoing userinfo packet
 * @class OutUserInfoPacket
 */
export class OutUserInfoPacket extends OutPacketBase {
    constructor(seq: number) {
        super()
        this.sequence = seq
        this.id = PacketId.UserInfo
    }

    public fullUserUpdate(user: User): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 100, incrementAmount: 20 })
        const fullUpdate: UserInfoFullUpdate = new UserInfoFullUpdate(user)

        this.buildHeader()
        this.writeUInt32(user.userId)
        fullUpdate.build(this)

        const resBuffer: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(resBuffer)

        return resBuffer
    }
}
