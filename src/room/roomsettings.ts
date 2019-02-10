import { NewRoomSettings } from 'room/newroomsettings'
import { IRoomOptions, RoomGamemode, RoomTeamBalance } from 'room/room'

export class RoomSettings {
    public roomName: string
    public maxPlayers: number
    public gameModeId: RoomGamemode
    public mapId: number
    public winLimit: number
    public killLimit: number
    public startMoney: number
    public forceCamera: number
    public nextMapEnabled: number
    public changeTeams: number
    public enableBots: number
    public difficulty: number
    public respawnTime: number
    public teamBalance: RoomTeamBalance
    public weaponRestrictions: number
    public hltvEnabled: number
    public mapCycleType: number
    public multiMaps: number[]
    public botEnabled: number
    public botDifficulty: number
    public numCtBots: number
    public numTrBots: number

    public unk00: number
    public unk01: number
    public unk02: number
    public unk03: number
    public unk09: string
    public unk10: number
    public unk13: number
    public unk17: number
    public unk18: number
    public unk20: number
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
    public unk40: number
    public unk43: number
    public unk45: number

    constructor(options?: IRoomOptions) {
        this.roomName = options.roomName ? options.roomName : 'Some room'
        this.gameModeId = options.gameModeId ? options.gameModeId : 0
        this.mapId = options.mapId ? options.mapId : 1
        this.winLimit = options.winLimit ? options.winLimit : 10
        this.killLimit = options.killLimit ? options.killLimit : 150
        this.startMoney = options.startMoney ? options.startMoney : 16000
        this.forceCamera = options.forceCamera ? options.forceCamera : 1
        this.nextMapEnabled = options.nextMapEnabled ? options.nextMapEnabled : 0
        this.changeTeams = options.changeTeams ? options.changeTeams : 0
        this.enableBots = options.enableBots ? options.enableBots : 0
        this.difficulty = options.difficulty ? options.difficulty : 0
        this.maxPlayers = options.enableBots ? 8 : 16
        this.respawnTime = options.respawnTime ? options.respawnTime : 3
        this.teamBalance = options.teamBalance ? options.teamBalance : 0
        this.weaponRestrictions = options.weaponRestrictions ? options.weaponRestrictions : 0
        this.hltvEnabled = options.hltvEnabled ? options.hltvEnabled : 0
        this.mapCycleType = 1
        this.multiMaps = []
        this.botEnabled = 0
        this.numCtBots = 0
        this.numTrBots = 0
        this.botDifficulty = 0
    }

    /**
     * update room's settings
     */
    public update(newSettings: NewRoomSettings): void {
        if (newSettings.roomName != null) {
            this.roomName = newSettings.roomName
        }
        if (newSettings.gameModeId != null) {
            this.gameModeId = newSettings.gameModeId
        }
        if (newSettings.mapId != null) {
            this.mapId = newSettings.mapId
        }
        if (newSettings.killLimit != null) {
            this.killLimit = newSettings.killLimit
        }
        if (newSettings.winLimit != null) {
            this.winLimit = newSettings.winLimit
        }
        if (newSettings.startMoney != null) {
            this.startMoney = newSettings.startMoney
        }
        if (newSettings.maxPlayers != null) {
            // reset bot number to 4 for each team when max players is changed
            // and the old max players value is bigger than the new one
            // this stops overflowing the max player number (where bots are included)
            if (this.maxPlayers > newSettings.maxPlayers) {
                if (this.botEnabled) {
                    this.numCtBots = this.numTrBots = 4
                }
            }

            this.maxPlayers = newSettings.maxPlayers

        }
        if (newSettings.respawnTime != null) {
            this.respawnTime = newSettings.respawnTime
        }
        if (newSettings.changeTeams != null) {
            this.changeTeams = newSettings.changeTeams
        }
        if (newSettings.enableBots != null) {
            this.enableBots = newSettings.enableBots
        }
        if (newSettings.difficulty != null) {
            this.difficulty = newSettings.difficulty
        }
        if (newSettings.forceCamera != null) {
            this.forceCamera = newSettings.forceCamera
        }
        if (newSettings.nextMapEnabled != null) {
            this.nextMapEnabled = newSettings.nextMapEnabled
        }
        if (newSettings.teamBalanceType != null) {
            this.teamBalance = newSettings.teamBalanceType
        }
        if (newSettings.weaponRestrictions != null) {
            this.weaponRestrictions = newSettings.weaponRestrictions
        }
        if (newSettings.hltvEnabled != null) {
            this.hltvEnabled = newSettings.hltvEnabled
        }
        if (newSettings.multiMaps != null) {
            this.multiMaps = newSettings.multiMaps
        }
        if (newSettings.botEnabled != null) {
            this.botEnabled = newSettings.botEnabled
            if (newSettings.botEnabled === 1) {
                this.botDifficulty = newSettings.botDifficulty
                this.numCtBots = newSettings.numCtBots
                this.numTrBots = newSettings.numTrBots
            } else {
                this.botDifficulty = 0
                this.numCtBots = 0
                this.numTrBots = 0
            }
        }

        if (newSettings.unk00 != null) {
            this.unk00 = newSettings.unk00
        }
        if (newSettings.unk01 != null) {
            this.unk01 = newSettings.unk01
        }
        if (newSettings.unk02 != null) {
            this.unk02 = newSettings.unk02
        }
        if (newSettings.unk03 != null) {
            this.unk03 = newSettings.unk03
        }
        if (newSettings.unk09 != null) {
            this.unk09 = newSettings.unk09
        }
        if (newSettings.unk10 != null) {
            this.unk10 = newSettings.unk10
        }
        if (newSettings.unk13 != null) {
            this.unk13 = newSettings.unk13
        }
        if (newSettings.unk17 != null) {
            this.unk17 = newSettings.unk17
        }
        if (newSettings.unk18 != null) {
            this.unk18 = newSettings.unk18
        }
        if (newSettings.unk20 != null) {
            this.unk20 = newSettings.unk20
        }
        if (newSettings.unk21 != null) {
            this.unk21 = newSettings.unk21
        }
        if (newSettings.unk23 != null) {
            this.unk23 = newSettings.unk23
        }
        if (newSettings.unk24 != null) {
            this.unk24 = newSettings.unk24
        }
        if (newSettings.unk25 != null) {
            this.unk25 = newSettings.unk25
        }
        if (newSettings.unk29 != null) {
            this.unk29 = newSettings.unk29
        }
        if (newSettings.unk30 != null) {
            this.unk30 = newSettings.unk30
        }
        if (newSettings.unk31 != null) {
            this.unk31 = newSettings.unk31
        }
        if (newSettings.unk32 != null) {
            this.unk32 = newSettings.unk32
        }
        if (newSettings.unk33 != null) {
            this.unk33 = newSettings.unk33
        }
        if (newSettings.unk35 != null) {
            this.unk35 = newSettings.unk35
        }
        if (newSettings.unk36 != null) {
            this.unk36 = newSettings.unk36
        }
        if (newSettings.unk37 != null) {
            this.unk37 = newSettings.unk37
        }
        if (newSettings.unk38 != null) {
            this.unk38 = newSettings.unk38
        }
        if (newSettings.unk39 != null) {
            this.unk39 = newSettings.unk39
        }
        if (newSettings.unk40 != null) {
            this.unk40 = newSettings.unk40
        }
        if (newSettings.unk43 != null) {
            this.unk43 = newSettings.unk43
        }
        if (newSettings.unk45 != null) {
            this.unk45 = newSettings.unk45
        }
    }
}
