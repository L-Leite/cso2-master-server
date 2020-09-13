import { InPacketBase } from 'packets/in/packet'

/**
 * received when an user scores a kill in a game match
 */
export class InHostIngame_AddKillCount {
    public isFakeClient: number
    public scorerId: number
    public unk03: number
    public unk04: number
    public newKillsNum: number
    public totalFrags: number
    public teamNum: number

    constructor(inPacket: InPacketBase) {
        this.isFakeClient = inPacket.readUInt8()
        this.scorerId = inPacket.readUInt32()
        this.unk03 = inPacket.readUInt8() // always 0
        this.unk04 = inPacket.readUInt32() // always 0
        this.newKillsNum = inPacket.readInt8()
        this.totalFrags = inPacket.readInt16()
        this.teamNum = inPacket.readUInt8()
    }
}
