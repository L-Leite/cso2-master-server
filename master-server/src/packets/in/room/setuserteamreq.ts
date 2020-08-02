import { InPacketBase } from 'packets/in/packet'

import { RoomTeamNum } from 'room/room'

/**
 * request of an user to change team
 * @class InRoomSetUserTeamRequest
 */
export class InRoomSetUserTeamRequest {
    public newTeam: RoomTeamNum

    constructor(inPacket: InPacketBase) {
        this.newTeam = inPacket.readUInt8() as RoomTeamNum
    }
}
