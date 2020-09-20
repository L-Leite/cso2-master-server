import { CSTeamNum } from 'gametypes/shareddefs'

export class MatchProgress {
    private started: boolean
    private ctRoundsWon: number
    private terRoundsWon: number

    constructor() {
        this.started = false
        this.ctRoundsWon = 0
        this.terRoundsWon = 0
    }

    public SetIngame(ingame: boolean): void {
        this.started = ingame
    }

    public GetWinningTeam(): CSTeamNum {
        if (this.ctRoundsWon > this.terRoundsWon) {
            return CSTeamNum.CounterTerrorist
        } else if (this.terRoundsWon > this.ctRoundsWon) {
            return CSTeamNum.Terrorist
        } else {
            return CSTeamNum.Unknown
        }
    }

    public ScoreTeam(team: CSTeamNum): void {
        if (this.started === false) {
            console.warn(
                'Tried to score a round when the game hasnt started yet'
            )
            return
        }

        if (team === CSTeamNum.Terrorist) {
            this.terRoundsWon++
        } else if (team === CSTeamNum.CounterTerrorist) {
            this.ctRoundsWon++
        } else {
            console.warn(`Unknown team ${team} won a round`)
        }
    }

    public GetDebugRoundEndMessage(winningTeam: CSTeamNum): string {
        let teamName = '(unknown team)'

        if (winningTeam === CSTeamNum.Terrorist) {
            teamName = 'terrorists'
        } else if (winningTeam === CSTeamNum.CounterTerrorist) {
            teamName = 'counter-terrorists'
        }

        return `${teamName} win the round. ct score: ${this.ctRoundsWon} ter score: ${this.terRoundsWon}`
    }
}
