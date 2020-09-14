import { InPacketBase } from 'packets/in/packet'

import { CSTeamNum } from 'gametypes/shareddefs'

/**
 * request of an user to change team
 * @class InRoomSetUserTeamRequest
 */
export class InRoomSetUserTeamRequest {
    public newTeam: CSTeamNum

    constructor(inPacket: InPacketBase) {
        this.newTeam = inPacket.readUInt8() as CSTeamNum
    }
}
