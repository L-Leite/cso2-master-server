import { WritableStreamBuffer } from 'stream-buffers'

import { UserData } from '../../userdata'
import { PacketId } from '../definitions'
import { OutPacketBase } from './packet'
import { UserInfoFullUpdate } from './userinfo/fulluserupdate'

/**
 * outgoing userinfo packet
 * @class OutUserInfoPacket
 */
export class OutUserInfoPacket extends OutPacketBase {
    constructor(seq: number) {
        super()
        this.sequence = seq
        this.packetId = PacketId.UserInfo
    }

    public fullUserUpdate(user: UserData): Buffer {
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
