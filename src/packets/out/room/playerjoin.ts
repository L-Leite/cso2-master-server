import { OutPacketBase } from 'packets/out/packet'

import { User } from 'user/user'

import { OutRoomPlayerNetInfo } from 'packets/out/room/playernetinfo'
import { UserInfoFullUpdate } from 'packets/out/userinfo/fulluserupdate'

import { RoomTeamNum } from 'room/room'

/**
 * tells the room users about a new member
 * @class OutRoomPlayerJoin
 */
export class OutRoomPlayerJoin {
    private netInfo: OutRoomPlayerNetInfo
    private player: User

    constructor(user: User, teamNum: RoomTeamNum) {
        this.netInfo = new OutRoomPlayerNetInfo(user, teamNum)
        this.player = user
    }
    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt32(this.player.userId)
        this.netInfo.build(outPacket)
        new UserInfoFullUpdate(this.player).build(outPacket)
    }
}
