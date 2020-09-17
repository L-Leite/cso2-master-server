import { IRoomOptions, RoomStatus } from 'room/room'
import { RoomGamemode, RoomTeamBalance } from 'gametypes/shareddefs'

export class RoomSettings {
    public roomName: string
    public roomPassword: string
    public maxPlayers: number
    public gameModeId: RoomGamemode
    public mapId: number
    public winLimit: number
    public killLimit: number
    public startMoney: number
    public forceCamera: number
    public nextMapEnabled: number
    public changeTeams: number
    public difficulty: number
    public respawnTime: number
    public teamBalanceType: RoomTeamBalance
    public weaponRestrictions: number
    public status: RoomStatus
    public hltvEnabled: number
    public mapCycleType: number
    public multiMaps: number[]
    public areBotsEnabled: boolean
    public botDifficulty: number
    public numCtBots: number
    public numTrBots: number
    public isIngame: boolean

    public unk00: number
    public unk01: number
    public unk02: number
    public unk03: number
    public unk10: number
    public unk13: number
    public unk17: number
    public unk18: number
    public unk21: number
    public unk23: number
    public unk24: number
    public unk25: number
    public unk29: number
    public unk30: number
    public unk31: number
    public unk32: number
    public unk33: number
    public unk35: number
    public unk36: number
    public unk37: number
    public unk38: number
    public unk39: number
    public unk43: number

    constructor(options?: IRoomOptions) {
        if (options == null) {
            return
        }

        this.roomName = options.roomName ? options.roomName : 'Some room'
        this.roomPassword = options.roomPassword ? options.roomPassword : ''
        this.gameModeId = options.gameModeId ? options.gameModeId : 0
        this.mapId = options.mapId ? options.mapId : 1
        this.winLimit = options.winLimit ? options.winLimit : 10
        this.killLimit = options.killLimit ? options.killLimit : 150
        this.startMoney = options.startMoney ? options.startMoney : 16000
        this.forceCamera = options.forceCamera ? options.forceCamera : 1
        this.nextMapEnabled = options.nextMapEnabled
            ? options.nextMapEnabled
            : 0
        this.changeTeams = options.changeTeams ? options.changeTeams : 0
        this.areBotsEnabled = options.enableBots ? true : false
        this.difficulty = options.difficulty ? options.difficulty : 0
        this.maxPlayers = options.enableBots ? 8 : 16
        this.respawnTime = options.respawnTime ? options.respawnTime : 3
        this.teamBalanceType = options.teamBalance ? options.teamBalance : 0
        this.weaponRestrictions = options.weaponRestrictions
            ? options.weaponRestrictions
            : 0
        this.status = RoomStatus.Waiting
        this.hltvEnabled = options.hltvEnabled ? options.hltvEnabled : 0
        this.mapCycleType = 1
        this.multiMaps = []
        this.numCtBots = 0
        this.numTrBots = 0
        this.botDifficulty = 0
        this.isIngame = false
    }
}
