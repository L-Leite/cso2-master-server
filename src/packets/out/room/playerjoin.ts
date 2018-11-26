import { OutPacketBase } from 'packets/out/packet'

import { User } from 'user/user'

import { OutRoomPlayerNetInfo } from 'packets/out/room/playernetinfo'
import { UserInfoFullUpdate } from 'packets/out/userinfo/fulluserupdate'

/**
 * Sub structure of Room packet
 * Stores information of a new room player
 * @class OutRoomPlayerJoin
 */
export class OutRoomPlayerJoin {
    private netInfo: OutRoomPlayerNetInfo
    private player: User

    constructor(user: User) {
        this.netInfo = new OutRoomPlayerNetInfo(user)
        this.player = user
    }
    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt32(this.player.userId)
        this.netInfo.build(outPacket)
        const userInfo = new UserInfoFullUpdate(this.player).build(outPacket)
    }
}
