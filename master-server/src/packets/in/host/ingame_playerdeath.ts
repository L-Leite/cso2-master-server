import { InPacketBase } from 'packets/in/packet'

import { Vector } from 'gametypes/vector'

// TODO: reverse missing flags
enum IPDKillFlags {
    KilledByHeadshot = 0x1,
    KilledThroughWall = 0x2,
    KilledByJumpshot = 0x4,
    KilledByLongshot = 0x8,
    KilledByKnife = 0x400,
    KilledByFalling = 0x1000,
    KilledWithSomeoneElseWeapon = 0x2000,
    KilledWithOpposingTeamWeapon = 0x4000,
    KilledByScopedSniper = 0x8000,
    KilledByNoscopedSniper = 0x10000,
    KilledWithLastBullet = 0x20000,
    KilledByGrenade = 0x40000,
    KilledByProp = 0x80000,
    KilledBySniper = 0x100000
}

enum IPDClientType {
    Human = 0,
    NPC = 1,
    FakeClient = 2 // a bot
}

enum IPDCharacterType {
    CSPlayer = 0,
    Pig = 40,
    Zombie = 50,
    ZombieMaster = 51, // the host zombie
    Sentrygun = 60
}

interface IPDPlayerInfo {
    userId: number
    weaponId: number
    teamNum: number
    clientType: IPDClientType
    characterType: IPDCharacterType
    characterClass: number
}

/**
 * received when an user scores a point in a game match
 */
export class InHostIngame_PlayerDeath {
    public killFlags: IPDKillFlags
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
