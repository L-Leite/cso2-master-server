import ip from 'ip'

import { OutPacketBase } from 'packets/out/packet'

import { RoomTeamNum } from 'room/room'
import { UserSession } from 'user/usersession'

import { ActiveConnections } from 'storage/activeconnections'

/**
 * shared room user structure
 * @class OutRoomPlayerNetInfo
 */
export class OutRoomPlayerNetInfo {
    public static build(userId: number, teamNum: RoomTeamNum, outPacket: OutPacketBase): void {
        const conn = ActiveConnections.Singleton().FindByOwnerId(userId)
        const session: UserSession = conn.getSession()

        if (session == null) {
            return
        }

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
