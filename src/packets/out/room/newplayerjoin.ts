import { UserData } from '../../../userdata'
import { OutPacketBase } from '../packet'
import { UserInfoFullUpdate } from '../userinfo/fulluserupdate'
import { RoomPlayerNetInfo } from './playernetinfo'

/**
 * Sub structure of Room packet
 * Stores information of a new room player
 * @class RoomNewPlayerJoin
 */
export class RoomNewPlayerJoin {
    private netInfo: RoomPlayerNetInfo
    private player: UserData

    constructor(user: UserData) {
        this.netInfo = new RoomPlayerNetInfo(user)
        this.player = user
    }
    public build(outPacket: OutPacketBase): void {
        this.netInfo.build(outPacket)
        const userInfo = new UserInfoFullUpdate(this.player).build(outPacket)
    }
}
