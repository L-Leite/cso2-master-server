import { InPacketBase } from 'packets/in/packet'

/**
 * received when a game's round is over
 */
export class InHostIngame_RoundEnd {
    public winningTeamNum: number
    public terWins: number
    public ctWins: number
    public unk: number

    constructor(inPacket: InPacketBase) {
        this.winningTeamNum = inPacket.readUInt8()
        this.terWins = inPacket.readUInt8()
        this.ctWins = inPacket.readUInt8()
        this.unk = inPacket.readUInt8()
    }
}
