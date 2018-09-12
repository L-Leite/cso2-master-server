import * as ip from 'ip'

import { UserData } from '../../../userdata'
import { OutPacketBase } from '../packet'

/**
 * Sub structure of Room packet
 * Stores network related info about an user
 * @class RoomPlayerNetInfo
 */
export class RoomPlayerNetInfo {
    private userId: number
    private playerUnk00: number
    private playerUnk01: number
    private playerUnk02: number
    private externalIpAddress: number
    private externalServerPort: number
    private externalClientPort: number
    private externalTvPort: number
    private localIpAddress: number
    private localServerPort: number
    private localClientPort: number
    private localTvPort: number

    constructor(user: UserData) {
        this.userId = user.userId
        this.playerUnk00 = 2
        this.playerUnk01 = 0
        this.playerUnk02 = 0
        this.externalIpAddress = ip.toLong(user.externalIpAddress)
        this.externalServerPort = user.externalServerPort
        this.externalClientPort = user.externalClientPort
        this.externalTvPort = user.externalTvPort
        this.localIpAddress = ip.toLong(user.localIpAddress)
        this.localServerPort = user.localServerPort
        this.localClientPort = user.localClientPort
        this.localTvPort = user.localTvPort
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt32(this.userId)
        outPacket.writeUInt8(this.playerUnk00)
        outPacket.writeUInt8(this.playerUnk01)
        outPacket.writeUInt8(this.playerUnk02)
        outPacket.writeUInt32(this.externalIpAddress, false)
        outPacket.writeUInt16(this.externalServerPort)
        outPacket.writeUInt16(this.externalClientPort)
        outPacket.writeUInt16(this.externalTvPort)
        outPacket.writeUInt32(this.localIpAddress, false)
        outPacket.writeUInt16(this.localServerPort)
        outPacket.writeUInt16(this.localClientPort)
        outPacket.writeUInt16(this.localTvPort)
    }
}
