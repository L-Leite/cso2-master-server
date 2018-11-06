import { InPacketBase } from 'packets/in/packet'

/**
 * Sub structure of Room packet
 * @class InRoomSwapTeamRequest
 */
export class InRoomSwapTeamRequest {
    public newTeam: number

    constructor(inPacket: InPacketBase) {
        this.newTeam = inPacket.readUInt8()
    }
}
