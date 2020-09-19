import { Vector } from 'gametypes/vector'

// TODO: reverse missing flags
export enum TDIKillFlags {
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

export enum TDIClientType {
    Human = 0,
    NPC = 1,
    FakeClient = 2 // a bot
}

export enum TDICharacterType {
    CSPlayer = 0,
    Pig = 40,
    Zombie = 50,
    ZombieMaster = 51, // the host zombie
    Sentrygun = 60
}

export interface TDIPlayerInfo {
    userId: number
    weaponId: number
    teamNum: number
    clientType: TDIClientType
    characterType: TDICharacterType
    characterClass: number
}

export interface CSO2TakeDamageInfo {
    killFlags: TDIKillFlags
    attacker: TDIPlayerInfo
    someVictimSpecialFlags: number
    victim: TDIPlayerInfo
    attackerPos: Vector
    victimPos: Vector
    unk01: number[]
    unk02: number[]
    unk03: number[]
    unk04: number[]
}
