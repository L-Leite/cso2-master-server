import { ExtendedSocket } from 'extendedsocket'
import { RoomReadyStatus, RoomTeamNum } from 'room/room'

/**
 * room info specific to a room's user
 */
export class RoomUserEntry {
    public userId: number
    public conn: ExtendedSocket
    public team: RoomTeamNum
    public ready: RoomReadyStatus
    public isIngame: boolean

    constructor(userId: number, connection: ExtendedSocket, team: RoomTeamNum, ready: RoomReadyStatus) {
        this.userId = userId
        this.conn = connection
        this.team = team
        this.ready = ready
        this.isIngame = false
    }

    /**
     * is the user ready?
     * @returns true if so, false if not
     */
    public isReady(): boolean {
        return this.ready === RoomReadyStatus.Ready
    }
}
