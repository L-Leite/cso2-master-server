import { ExtendedSocket } from 'extendedsocket'
import { RoomReadyStatus } from 'room/room'
import { CSTeamNum } from 'gametypes/shareddefs'

/**
 * room info specific to a room's user
 */
export class RoomUserEntry {
    public userId: number
    public conn: ExtendedSocket
    public team: CSTeamNum
    public ready: RoomReadyStatus
    public isIngame: boolean

    public kills: number
    public headshots: number
    public deaths: number
    public assists: number

    constructor(
        userId: number,
        connection: ExtendedSocket,
        team: CSTeamNum,
        ready: RoomReadyStatus
    ) {
        this.userId = userId
        this.conn = connection
        this.team = team
        this.ready = ready
        this.isIngame = false

        this.kills = 0
        this.headshots = 0
        this.deaths = 0
        this.assists = 0
    }

    /**
     * is the user ready?
     * @returns true if so, false if not
     */
    public isReady(): boolean {
        return this.ready === RoomReadyStatus.Ready
    }
}
