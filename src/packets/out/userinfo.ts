import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { UserInfoFullUpdate } from 'packets/out/userinfo/fulluserupdate'

/**
 * outgoing userinfo packet
 * @class OutUserInfoPacket
 */
export class OutUserInfoPacket extends OutPacketBase {
    public static async fullUserUpdate(userId: number): Promise<OutUserInfoPacket> {
        const packet: OutUserInfoPacket = new OutUserInfoPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 100, incrementAmount: 20 })

        packet.buildHeader()
        packet.writeUInt32(userId)

        await UserInfoFullUpdate.build(userId, packet)

        return packet
    }

    constructor() {
        super(PacketId.UserInfo)
    }
}
