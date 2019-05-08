import { OutPacketBase } from 'packets/out/packet'

import { OutRoomPlayerNetInfo } from 'packets/out/room/playernetinfo'
import { UserInfoFullUpdate } from 'packets/out/userinfo/fulluserupdate'

import { RoomTeamNum } from 'room/room'

/**
 * tells the room users about a new member
 * @class OutRoomPlayerJoin
 */
export class OutRoomPlayerJoin {
    public static async build(userId: number, teamNum: RoomTeamNum, outPacket: OutPacketBase): Promise<void> {
        outPacket.writeUInt32(userId)
        await OutRoomPlayerNetInfo.build(userId, teamNum, outPacket)
        await UserInfoFullUpdate.build(userId, outPacket)
    }
}
