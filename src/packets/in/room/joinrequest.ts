import { InPacketBase } from 'packets/in/packet'

/**
 * an user's request to join a room
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
