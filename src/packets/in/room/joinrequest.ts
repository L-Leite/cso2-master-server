import { InPacketBase } from 'packets/in/packet'

/**
 * an user's request to join a room
 * @class InRoomJoinRequest
 */
export class InRoomJoinRequest {
    public roomId: number
    public roomPassword: string

    constructor(inPacket: InPacketBase) {
        this.roomId = inPacket.readUInt16()
        this.roomPassword = inPacket.readString()
    }
}
