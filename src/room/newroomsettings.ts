import { Uint64LE } from 'int64-buffer'

import { Room } from 'room/room'
import { RoomSettings } from 'room/roomsettings'

import { InRoomUpdateSettings } from 'packets/in/room/updatesettings'

export class NewRoomSettings {
    public static from(updateSettings: InRoomUpdateSettings): NewRoomSettings {
        const newSettings: NewRoomSettings = new NewRoomSettings()

        if (updateSettings.roomName != null) {
            newSettings.roomName = updateSettings.roomName
        }
        if (updateSettings.gameModeId != null) {
            newSettings.gameModeId = updateSettings.gameModeId
        }
        if (updateSettings.mapId != null) {
            newSettings.mapId = updateSettings.mapId
        }
        if (updateSettings.killLimit != null) {
            newSettings.killLimit = updateSettings.killLimit
        }
        if (updateSettings.winLimit != null) {
            newSettings.winLimit = updateSettings.winLimit
        }
        if (updateSettings.startMoney != null) {
            newSettings.startMoney = updateSettings.startMoney
        }
        if (updateSettings.maxPlayers != null) {
            newSettings.maxPlayers = updateSettings.maxPlayers
        }
        if (updateSettings.respawnTime != null) {
            newSettings.respawnTime = updateSettings.respawnTime
        }
        if (updateSettings.changeTeams != null) {
            newSettings.changeTeams = updateSettings.changeTeams
        }
        if (updateSettings.forceCamera != null) {
            newSettings.forceCamera = updateSettings.forceCamera
        }
        if (updateSettings.teamBalance != null) {
            newSettings.teamBalanceType = updateSettings.teamBalance
        }
        if (updateSettings.weaponRestrictions != null) {
            newSettings.weaponRestrictions = updateSettings.weaponRestrictions
        }
        if (updateSettings.hltvEnabled != null) {
            newSettings.hltvEnabled = updateSettings.hltvEnabled
        }
        if (updateSettings.mapCycleType != null) {
            newSettings.mapCycleType = updateSettings.mapCycleType
        }
        if (updateSettings.multiMaps != null) {
            newSettings.multiMaps = updateSettings.multiMaps
        }

        if (updateSettings.unk00 != null) {
            newSettings.unk00 = updateSettings.unk00
        }
        if (updateSettings.unk01 != null) {
            newSettings.unk01 = updateSettings.unk01
        }
        if (updateSettings.unk02 != null) {
            newSettings.unk02 = updateSettings.unk02
        }
        if (updateSettings.unk03 != null) {
            newSettings.unk03 = updateSettings.unk03
        }
        if (updateSettings.unk09 != null) {
            newSettings.unk09 = updateSettings.unk09
        }
        if (updateSettings.unk10 != null) {
            newSettings.unk10 = updateSettings.unk10
        }
        if (updateSettings.unk13 != null) {
            newSettings.unk13 = updateSettings.unk13
        }
        if (updateSettings.unk17 != null) {
            newSettings.unk17 = updateSettings.unk17
        }
        if (updateSettings.unk18 != null) {
            newSettings.unk18 = updateSettings.unk18
        }
        if (updateSettings.unk20 != null) {
            newSettings.unk20 = updateSettings.unk20
        }
        if (updateSettings.unk21 != null) {
            newSettings.unk21 = updateSettings.unk21
        }
        if (updateSettings.unk23 != null) {
            newSettings.unk23 = updateSettings.unk23
        }
        if (updateSettings.unk24 != null) {
            newSettings.unk24 = updateSettings.unk24
        }
        if (updateSettings.unk25 != null) {
            newSettings.unk25 = updateSettings.unk25
        }
        if (updateSettings.unk29 != null) {
            newSettings.unk29 = updateSettings.unk29
        }
        if (updateSettings.unk30 != null) {
            newSettings.unk30 = updateSettings.unk30
        }
        if (updateSettings.unk31 != null) {
            newSettings.unk31 = updateSettings.unk31
        }
        if (updateSettings.unk32 != null) {
            newSettings.unk32 = updateSettings.unk32
        }
        if (updateSettings.unk33 != null) {
            newSettings.unk33 = updateSettings.unk33
        }
        if (updateSettings.botEnabled != null) {
            newSettings.botEnabled = updateSettings.botEnabled

            if (newSettings.botEnabled === 1) {
                newSettings.botDifficulty = updateSettings.botDifficulty
                newSettings.numCtBots = updateSettings.numCtBots
                newSettings.numTrBots = updateSettings.numTrBots
            }
        }
        if (updateSettings.unk35 != null) {
            newSettings.unk35 = updateSettings.unk35
        }
        if (updateSettings.unk36 != null) {
            newSettings.unk36 = updateSettings.unk36
        }
        if (updateSettings.unk37 != null) {
            newSettings.unk37 = updateSettings.unk37
        }
        if (updateSettings.unk38 != null) {
            newSettings.unk38 = updateSettings.unk38
        }
        if (updateSettings.unk39 != null) {
            newSettings.unk39 = updateSettings.unk39
        }
        if (updateSettings.unk40 != null) {
            newSettings.unk40 = updateSettings.unk40
        }
        if (updateSettings.unk43 != null) {
            newSettings.unk43 = updateSettings.unk43
        }
        if (updateSettings.unk45 != null) {
            newSettings.unk45 = updateSettings.unk45
        }

        return newSettings
    }

    public static fromRoom(room: Room): NewRoomSettings {
        const newSettings: NewRoomSettings = new NewRoomSettings()
        const settings: RoomSettings = room.settings

        if (settings.roomName != null) {
            newSettings.roomName = settings.roomName
        }
        if (settings.gameModeId != null) {
            newSettings.gameModeId = settings.gameModeId
        }
        if (settings.mapId != null) {
            newSettings.mapId = settings.mapId
        }
        if (settings.killLimit != null) {
            newSettings.killLimit = settings.killLimit
        }
        if (settings.winLimit != null) {
            newSettings.winLimit = settings.winLimit
        }
        if (settings.startMoney != null) {
            newSettings.startMoney = settings.startMoney
        }
        if (settings.maxPlayers != null) {
            newSettings.maxPlayers = settings.maxPlayers
        }
        if (settings.respawnTime != null) {
            newSettings.respawnTime = settings.respawnTime
        }
        if (settings.changeTeams != null) {
            newSettings.changeTeams = settings.changeTeams
        }
        if (settings.enableBots != null) {
            newSettings.enableBots = settings.enableBots
        }
        if (settings.difficulty != null) {
            newSettings.difficulty = settings.difficulty
        }
        if (settings.forceCamera != null) {
            newSettings.forceCamera = settings.forceCamera
        }
        if (settings.nextMapEnabled != null) {
            newSettings.nextMapEnabled = settings.nextMapEnabled
        }
        if (settings.teamBalance != null) {
            newSettings.teamBalanceType = settings.teamBalance
        }
        if (settings.weaponRestrictions != null) {
            newSettings.weaponRestrictions = settings.weaponRestrictions
        }
        if (settings.hltvEnabled != null) {
            newSettings.hltvEnabled = settings.hltvEnabled
        }
        if (settings.multiMaps != null) {
            newSettings.multiMaps = settings.multiMaps
        }

        if (settings.unk00 != null) {
            newSettings.unk00 = settings.unk00
        }
        if (settings.unk01 != null) {
            newSettings.unk01 = settings.unk01
        }
        if (settings.unk02 != null) {
            newSettings.unk02 = settings.unk02
        }
        if (settings.unk03 != null) {
            newSettings.unk03 = settings.unk03
        }
        if (settings.unk09 != null) {
            newSettings.unk09 = settings.unk09
        }
        if (settings.unk10 != null) {
            newSettings.unk10 = settings.unk10
        }
        if (settings.unk13 != null) {
            newSettings.unk13 = settings.unk13
        }
        if (settings.unk17 != null) {
            newSettings.unk17 = settings.unk17
        }
        if (settings.unk18 != null) {
            newSettings.unk18 = settings.unk18
        }
        if (settings.unk20 != null) {
            newSettings.unk20 = settings.unk20
        }
        if (settings.unk21 != null) {
            newSettings.unk21 = settings.unk21
        }
        if (settings.unk23 != null) {
            newSettings.unk23 = settings.unk23
        }
        if (settings.unk24 != null) {
            newSettings.unk24 = settings.unk24
        }
        if (settings.unk25 != null) {
            newSettings.unk25 = settings.unk25
        }
        if (settings.unk29 != null) {
            newSettings.unk29 = settings.unk29
        }
        if (settings.unk30 != null) {
            newSettings.unk30 = settings.unk30
        }
        if (settings.unk31 != null) {
            newSettings.unk31 = settings.unk31
        }
        if (settings.unk32 != null) {
            newSettings.unk32 = settings.unk32
        }
        if (settings.unk33 != null) {
            newSettings.unk33 = settings.unk33
        }
        if (settings.botEnabled != null) {
            newSettings.botEnabled = settings.botEnabled

            if (settings.botEnabled) {
                newSettings.botDifficulty = settings.botDifficulty
                newSettings.numCtBots = settings.numCtBots
                newSettings.numTrBots = settings.numTrBots
            }
        }
        if (settings.unk35 != null) {
            newSettings.unk35 = settings.unk35
        }
        if (settings.unk36 != null) {
            newSettings.unk36 = settings.unk36
        }
        if (settings.unk37 != null) {
            newSettings.unk37 = settings.unk37
        }
        if (settings.unk38 != null) {
            newSettings.unk38 = settings.unk38
        }
        if (settings.unk39 != null) {
            newSettings.unk39 = settings.unk39
        }
        if (settings.unk40 != null) {
            newSettings.unk40 = settings.unk40
        }
        if (settings.unk43 != null) {
            newSettings.unk43 = settings.unk43
        }
        if (settings.unk45 != null) {
            newSettings.unk45 = settings.unk45
        }

        return newSettings
    }

    public roomName: string
    public maxPlayers: number
    public gameModeId: number
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
    public teamBalanceType: number
    public weaponRestrictions: number
    public hltvEnabled: number
    public mapCycleType: number
    public multiMaps: number[]

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
    public botEnabled: number
    public botDifficulty: number
    public numCtBots: number
    public numTrBots: number
    public unk35: number
    public unk36: number
    public unk37: number
    public unk38: number
    public unk39: number
    public unk40: number
    public unk43: number
    public unk45: number

    public getFlags(): Uint64LE {
        let lowFlag: number = 0
        let highFlag: number = 0

        /* tslint:disable: no-bitwise */
        if (this.roomName != null) {
            lowFlag |= 0x1
        }
        if (this.unk00 != null) {
            lowFlag |= 0x2
        }
        if (this.unk01 != null && this.unk02 != null && this.unk03 != null) {
            lowFlag |= 0x4
        }
        if (this.unk09 != null) {
            lowFlag |= 0x8
        }
        if (this.unk10 != null) {
            lowFlag |= 0x10
        }
        if (this.forceCamera != null) {
            lowFlag |= 0x20
        }
        if (this.gameModeId != null) {
            lowFlag |= 0x40
        }
        if (this.mapId != null && this.unk13 != null) {
            lowFlag |= 0x80
        }
        if (this.maxPlayers != null) {
            lowFlag |= 0x100
        }
        if (this.winLimit != null) {
            lowFlag |= 0x200
        }
        if (this.killLimit != null) {
            lowFlag |= 0x400
        }
        if (this.unk17 != null) {
            lowFlag |= 0x800
        }
        if (this.unk18 != null) {
            lowFlag |= 0x1000
        }
        if (this.weaponRestrictions != null) {
            lowFlag |= 0x2000
        }
        if (this.unk20 != null) {
            lowFlag |= 0x4000
        }
        if (this.unk21 != null && this.mapCycleType != null && this.unk23 != null && this.unk24 != null) {
            lowFlag |= 0x8000
        }
        if (this.unk25 != null) {
            lowFlag |= 0x10000
        }
        if (this.multiMaps != null) {
            lowFlag |= 0x20000
        }
        if (this.teamBalanceType != null) {
            lowFlag |= 0x40000
        }
        if (this.unk29 != null) {
            lowFlag |= 0x80000
        }
        if (this.unk30 != null) {
            lowFlag |= 0x100000
        }
        if (this.unk31 != null) {
            lowFlag |= 0x200000
        }
        if (this.unk32 != null) {
            lowFlag |= 0x400000
        }
        if (this.unk33 != null) {
            lowFlag |= 0x800000
        }
        if (this.botEnabled != null) {
            lowFlag |= 0x1000000
        }

        if (this.unk35 != null) {
            lowFlag |= 0x2000000
        }

        if (this.unk36 != null) {
            lowFlag |= 0x4000000
        }

        if (this.unk37 != null) {
            lowFlag |= 0x8000000
        }

        if (this.unk38 != null) {
            lowFlag |= 0x10000000
        }

        if (this.unk39 != null) {
            lowFlag |= 0x20000000
        }

        if (this.unk40 != null) {
            lowFlag |= 0x40000000
        }

        if (this.startMoney != null) {
            lowFlag |= 0x80000000
        }

        if (this.changeTeams != null) {
            highFlag |= 0x1
        }

        if (this.unk43 != null) {
            highFlag |= 0x2
        }

        if (this.hltvEnabled != null) {
            highFlag |= 0x4
        }

        if (this.unk45 != null) {
            highFlag |= 0x8
        }

        if (this.respawnTime != null) {
            highFlag |= 0x10
        }
        /* tslint:enable: no-bitwise */

        const flags: Uint64LE = new Uint64LE(highFlag, lowFlag)
        return flags
    }
}
