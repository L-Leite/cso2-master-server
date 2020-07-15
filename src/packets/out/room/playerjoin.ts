import { OutPacketBase } from 'packets/out/packet'

import { OutRoomPlayerNetInfo } from 'packets/out/room/playernetinfo'
import { UserInfoFullUpdate } from 'packets/out/userinfo/fulluserupdate'

import { RoomTeamNum } from 'room/room'

import { ExtendedSocket } from 'extendedsocket'
import { User } from 'user/user'

/**
 * tells the room users about a new member
 * @class OutRoomPlayerJoin
 */
export class OutRoomPlayerJoin {
    public static build(conn: ExtendedSocket, teamNum: RoomTeamNum, outPacket: OutPacketBase): void {
        const user: User = conn.session.user

        outPacket.writeUInt32(user.id)
        OutRoomPlayerNetInfo.build(conn, teamNum, outPacket)
        UserInfoFullUpdate.build(user, outPacket)
    }
}
