import ip from 'ip'

import { OutPacketBase } from 'packets/out/packet'

import { CSTeamNum } from 'gametypes/shareddefs'
import { UserSession } from 'user/usersession'

import { ExtendedSocket } from 'extendedsocket'

/**
 * shared room user structure
 * @class OutRoomPlayerNetInfo
 */
export class OutRoomPlayerNetInfo {
    public static build(
        conn: ExtendedSocket,
        teamNum: CSTeamNum,
        outPacket: OutPacketBase
    ): void {
        const session: UserSession = conn.session

        outPacket.writeUInt8(teamNum)
        outPacket.writeUInt8(0) // unk01
        outPacket.writeUInt8(0) // unk02
        outPacket.writeUInt32(ip.toLong(session.externalNet.ipAddress), false)
        outPacket.writeUInt16(session.externalNet.serverPort)
        outPacket.writeUInt16(session.externalNet.clientPort)
        outPacket.writeUInt16(session.externalNet.tvPort)
        outPacket.writeUInt32(ip.toLong(session.internalNet.ipAddress), false)
        outPacket.writeUInt16(session.internalNet.serverPort)
        outPacket.writeUInt16(session.internalNet.clientPort)
        outPacket.writeUInt16(session.internalNet.tvPort)
    }
}
