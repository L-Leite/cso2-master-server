import { RoomReadyStatus, RoomTeamNum } from 'room/room'

/**
 * room info specific to a room's user
 * @class RoomUser
 */
export class RoomUser {
    public team: RoomTeamNum
    public ready: RoomReadyStatus
    public entityNum: number

    constructor(team: RoomTeamNum, ready: RoomReadyStatus, entNum: number) {
        this.team = team
        this.ready = ready
        this.entityNum = entNum
    }
}
