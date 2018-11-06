import { InPacketBase } from 'packets/in/packet'

/**
 * Sub structure of Room packet
 * @class InRoomJoinRequest
 */
export class InRoomJoinRequest {
    public roomId: number
    public password: string // unconfirmed

    constructor(inPacket: InPacketBase) {
        this.roomId = inPacket.readUInt8()
        this.password = inPacket.readLongString()
    }
}
