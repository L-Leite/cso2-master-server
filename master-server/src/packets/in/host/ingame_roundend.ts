import { InPacketBase } from 'packets/in/packet'

import { CSTeamNum } from 'gametypes/shareddefs'

/**
 * received when a game's round is over
 */
export class InHostIngame_RoundEnd {
    public winningTeamNum: CSTeamNum
    public terWins: number
    public ctWins: number
    public unk: number

    constructor(inPacket: InPacketBase) {
        const winner = inPacket.readUInt8()

        if (
            winner === CSTeamNum.Terrorist ||
            winner === CSTeamNum.CounterTerrorist
        ) {
            this.winningTeamNum = winner
        } else {
            console.warn(`Parsed unknown team ${winner} from round end packet`)
            this.winningTeamNum = CSTeamNum.Unknown
        }

        this.terWins = inPacket.readUInt8()
        this.ctWins = inPacket.readUInt8()
        this.unk = inPacket.readUInt8()
    }
}
