import { OutPacketBase } from 'packets/out/packet'

import { OutRoomPlayerNetInfo } from 'packets/out/room/playernetinfo'
import { UserInfoFullUpdate } from 'packets/out/userinfo/fulluserupdate'

import { RoomTeamNum } from 'room/room'

import { User } from 'user/user'

/**
 * tells the room users about a new member
 * @class OutRoomPlayerJoin
 */
export class OutRoomPlayerJoin {
    public static async build(user: User, teamNum: RoomTeamNum, outPacket: OutPacketBase): Promise<void> {
        outPacket.writeUInt32(user.userId)
        await OutRoomPlayerNetInfo.build(user.userId, teamNum, outPacket)
        await UserInfoFullUpdate.build(user, outPacket)
    }
}
