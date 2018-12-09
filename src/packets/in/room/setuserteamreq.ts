import { InPacketBase } from 'packets/in/packet'

import { RoomTeamNum } from 'room/room'

/**
 * Sub structure of Room packet
 * @class InRoomSetUserTeamRequest
 */
export class InRoomSetUserTeamRequest {
    public newTeam: RoomTeamNum

    constructor(inPacket: InPacketBase) {
        this.newTeam = inPacket.readUInt8() as RoomTeamNum
    }
}
