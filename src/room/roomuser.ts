import { RoomReadyStatus, RoomTeamNum } from 'room/room'

/**
 * room info specific to a room's user
 * @class RoomUser
 */
export class RoomUser {
    public team: RoomTeamNum
    public ready: RoomReadyStatus
    public isIngame: boolean

    constructor(team: RoomTeamNum, ready: RoomReadyStatus) {
        this.team = team
        this.ready = ready
        this.isIngame = false
    }
}
