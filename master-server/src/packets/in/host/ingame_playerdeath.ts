import { InPacketBase } from 'packets/in/packet'

import { Vector } from 'gamestructs/vector'

interface IPDPlayerInfo {
    userId: number
    weaponId: number
    teamNum: number
    clientType: number
    characterType: number
    characterClass: number
}

/**
 * received when an user scores a point in a game match
 */
export class InHostIngame_PlayerDeath {
    public killFlags: number
    public attacker: IPDPlayerInfo
    public someVictimSpecialFlags: number
    public victim: IPDPlayerInfo
    public attackerPos: Vector
    public victimPos: Vector
    public unk22: number
    public unk23: number[]
    public unk24: number[]
    public unk25: number[]
    public unk26: number[]

    constructor(inPacket: InPacketBase) {
        this.killFlags = inPacket.readUInt32()
        this.attacker = {
            userId: inPacket.readUInt32(),
            weaponId: inPacket.readUInt32(),
            teamNum: inPacket.readUInt8(),
            clientType: inPacket.readUInt8(),
            characterType: inPacket.readUInt8(),
            characterClass: inPacket.readUInt32()
        }
        this.someVictimSpecialFlags = inPacket.readUInt32()
        this.victim = {
            userId: inPacket.readUInt32(),
            weaponId: inPacket.readUInt32(),
            teamNum: inPacket.readUInt8(),
            clientType: inPacket.readUInt8(),
            characterType: inPacket.readUInt8(),
            characterClass: inPacket.readUInt32()
        }
        this.attackerPos = new Vector(
            inPacket.readInt32(),
            inPacket.readInt32(),
            inPacket.readInt32()
        )
        this.victimPos = new Vector(
            inPacket.readInt32(),
            inPacket.readInt32(),
            inPacket.readInt32()
        )
        this.unk22 = inPacket.readUInt16()

        this.unk23 = []
        this.unk24 = []
        this.unk25 = []
        this.unk26 = []

        for (let i = 0; i < this.unk22; i++) {
            this.unk23.push(inPacket.readUInt8())
            this.unk24.push(inPacket.readUInt32())
            this.unk25.push(inPacket.readUInt32())
            this.unk26.push(inPacket.readUInt8())
        }
    }
}
