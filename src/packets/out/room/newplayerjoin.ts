import { OutPacketBase } from 'packets/out/packet'

import { User } from 'user/user'

import { RoomPlayerNetInfo } from 'packets/out/room/playernetinfo'
import { UserInfoFullUpdate } from 'packets/out/userinfo/fulluserupdate'

/**
 * Sub structure of Room packet
 * Stores information of a new room player
 * @class RoomNewPlayerJoin
 */
export class RoomNewPlayerJoin {
    private netInfo: RoomPlayerNetInfo
    private player: User

    constructor(user: User) {
        this.netInfo = new RoomPlayerNetInfo(user)
        this.player = user
    }
    public build(outPacket: OutPacketBase): void {
        this.netInfo.build(outPacket)
        const userInfo = new UserInfoFullUpdate(this.player).build(outPacket)
    }
}
