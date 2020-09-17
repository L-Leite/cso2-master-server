import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { UserInfoDynamicUpdate } from 'packets/out/userinfo/dynamicuserupdate'
import { UserInfoFullUpdate } from 'packets/out/userinfo/fulluserupdate'

import { User } from 'user/user'

/**
 * outgoing userinfo packet
 * @class OutUserInfoPacket
 */
export class OutUserInfoPacket extends OutPacketBase {
    public static fullUserUpdate(user: User): OutUserInfoPacket {
        const packet: OutUserInfoPacket = new OutUserInfoPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 100,
            incrementAmount: 20
        })

        packet.buildHeader()
        packet.writeUInt32(user.id)

        UserInfoFullUpdate.build(user, packet)

        return packet
    }

    public static updateCampaignFlags(user: User): OutUserInfoPacket {
        const packet: OutUserInfoPacket = new OutUserInfoPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 100,
            incrementAmount: 20
        })

        packet.buildHeader()
        packet.writeUInt32(user.id)

        UserInfoDynamicUpdate.buildCampaign(user.campaign_flags, packet)

        return packet
    }

    public static updateAvatar(user: User): OutUserInfoPacket {
        const packet: OutUserInfoPacket = new OutUserInfoPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 100,
            incrementAmount: 20
        })

        packet.buildHeader()
        packet.writeUInt32(user.id)

        UserInfoDynamicUpdate.buildAvatar(user.avatar, packet)

        return packet
    }

    public static updateSignature(user: User): OutUserInfoPacket {
        const packet: OutUserInfoPacket = new OutUserInfoPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 100,
            incrementAmount: 20
        })

        packet.buildHeader()
        packet.writeUInt32(user.id)

        UserInfoDynamicUpdate.buildSignature(user.signature, packet)

        return packet
    }

    public static updateTitle(user: User): OutUserInfoPacket {
        const packet: OutUserInfoPacket = new OutUserInfoPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 100,
            incrementAmount: 20
        })

        packet.buildHeader()
        packet.writeUInt32(user.id)

        UserInfoDynamicUpdate.buildTitle(user.title, packet)

        return packet
    }

    public static updateGameStats(user: User): OutUserInfoPacket {
        const packet: OutUserInfoPacket = new OutUserInfoPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 40,
            incrementAmount: 10
        })

        packet.buildHeader()
        packet.writeUInt32(user.id)

        UserInfoDynamicUpdate.buildGameStats(
            user.played_matches,
            user.wins,
            user.kills,
            user.headshots,
            user.deaths,
            user.assists,
            user.accuracy,
            user.seconds_played,
            packet
        )

        return packet
    }

    constructor() {
        super(PacketId.UserInfo)
    }
}
