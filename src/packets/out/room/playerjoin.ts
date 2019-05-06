import { OutPacketBase } from 'packets/out/packet'

import { OutRoomPlayerNetInfo } from 'packets/out/room/playernetinfo'
import { UserInfoFullUpdate } from 'packets/out/userinfo/fulluserupdate'

import { RoomTeamNum } from 'room/room'

/**
 * tells the room users about a new member
 * @class OutRoomPlayerJoin
 */
export class OutRoomPlayerJoin {
    public static build(userId: number, teamNum: RoomTeamNum, outPacket: OutPacketBase): void {
        outPacket.writeUInt32(userId)
        OutRoomPlayerNetInfo.build(userId, teamNum, outPacket)
        UserInfoFullUpdate.build(userId, outPacket)
    }
}
