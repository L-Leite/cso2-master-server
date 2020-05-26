import { Uint64LE } from 'int64-buffer'

import { OutPacketBase } from 'packets/out/packet'

import { RoomSettings } from 'room/roomsettings'

/**
 * sends out any updated room's settings
 * @class OutRoomUpdateSettings
 */
export class OutRoomUpdateSettings {
    public static getFlags(settings: RoomSettings): Uint64LE {
        let lowFlag: number = 0
        let highFlag: number = 0

        /* tslint:disable: no-bitwise */
        if (settings.roomName != null) {
            lowFlag |= 0x1
        }
        if (settings.unk00 != null) {
            lowFlag |= 0x2
        }
        if (settings.unk01 != null && settings.unk02 != null && settings.unk03 != null) {
            lowFlag |= 0x4
        }
        if (settings.roomPassword != null) {
            lowFlag |= 0x8
        }
        if (settings.unk10 != null) {
            lowFlag |= 0x10
        }
        if (settings.forceCamera != null) {
            lowFlag |= 0x20
        }
        if (settings.gameModeId != null) {
            lowFlag |= 0x40
        }
        if (settings.mapId != null && settings.unk13 != null) {
            lowFlag |= 0x80
        }
        if (settings.maxPlayers != null) {
            lowFlag |= 0x100
        }
        if (settings.winLimit != null) {
            lowFlag |= 0x200
        }
        if (settings.killLimit != null) {
            lowFlag |= 0x400
        }
        if (settings.unk17 != null) {
            lowFlag |= 0x800
        }
        if (settings.unk18 != null) {
            lowFlag |= 0x1000
        }
        if (settings.weaponRestrictions != null) {
            lowFlag |= 0x2000
        }
        if (settings.status != null) {
            lowFlag |= 0x4000
        }
        if (settings.unk21 != null
            && settings.mapCycleType != null
            && settings.unk23 != null
            && settings.unk24 != null) {
            lowFlag |= 0x8000
        }
        if (settings.unk25 != null) {
            lowFlag |= 0x10000
        }
        if (settings.multiMaps != null) {
            lowFlag |= 0x20000
        }
        if (settings.teamBalanceType != null) {
            lowFlag |= 0x40000
        }
        if (settings.unk29 != null) {
            lowFlag |= 0x80000
        }
        if (settings.unk30 != null) {
            lowFlag |= 0x100000
        }
        if (settings.unk31 != null) {
            lowFlag |= 0x200000
        }
        if (settings.unk32 != null) {
            lowFlag |= 0x400000
        }
        if (settings.unk33 != null) {
            lowFlag |= 0x800000
        }
        if (settings.areBotsEnabled != null) {
            lowFlag |= 0x1000000
        }

        if (settings.unk35 != null) {
            lowFlag |= 0x2000000
        }

        if (settings.unk36 != null) {
            lowFlag |= 0x4000000
        }

        if (settings.unk37 != null) {
            lowFlag |= 0x8000000
        }

        if (settings.unk38 != null) {
            lowFlag |= 0x10000000
        }

        if (settings.unk39 != null) {
            lowFlag |= 0x20000000
        }

        if (settings.isIngame != null) {
            lowFlag |= 0x40000000
        }

        if (settings.startMoney != null) {
            lowFlag |= 0x80000000
        }

        if (settings.changeTeams != null) {
            highFlag |= 0x1
        }

        if (settings.unk43 != null) {
            highFlag |= 0x2
        }

        if (settings.hltvEnabled != null) {
            highFlag |= 0x4
        }

        if (settings.difficulty != null) {
            highFlag |= 0x8
        }

        if (settings.respawnTime != null) {
            highFlag |= 0x10
        }
        /* tslint:enable: no-bitwise */

        const flags: Uint64LE = new Uint64LE(highFlag, lowFlag)
        return flags
    }

    public static build(settings: RoomSettings, outPacket: OutPacketBase): void {
        const flags: Uint64LE = this.getFlags(settings)

        outPacket.writeUInt64(flags)

        // int64-buffer doesn't have bitwise operations,
        // so split it to two 32 bit values and use them instead
        const flagBuf: Buffer = flags.toBuffer(true)
        const lowFlag = flagBuf.readUInt32LE(0)
        const highFlag = flagBuf.readUInt32LE(4)

        // disable linter bitwise restrictions so we can check the flags
        /* tslint:disable: no-bitwise */
        if (lowFlag & 0x1) {
            outPacket.writeString(settings.roomName)
        }
        if (lowFlag & 0x2) {
            outPacket.writeUInt8(settings.unk00)
        }
        if (lowFlag & 0x4) {
            outPacket.writeUInt8(settings.unk01)
            outPacket.writeUInt32(settings.unk02)
            outPacket.writeUInt32(settings.unk03)
        }
        if (lowFlag & 0x8) {
            outPacket.writeString(settings.roomPassword)
        }
        if (lowFlag & 0x10) {
            outPacket.writeUInt16(settings.unk10)
        }
        if (lowFlag & 0x20) {
            outPacket.writeUInt8(settings.forceCamera)
        }
        if (lowFlag & 0x40) {
            outPacket.writeUInt8(settings.gameModeId)
        }
        if (lowFlag & 0x80) {
            outPacket.writeUInt8(settings.mapId)
            outPacket.writeUInt8(settings.unk13)
        }
        if (lowFlag & 0x100) {
            outPacket.writeUInt8(settings.maxPlayers)
        }
        if (lowFlag & 0x200) {
            outPacket.writeUInt8(settings.winLimit)
        }
        if (lowFlag & 0x400) {
            outPacket.writeUInt16(settings.killLimit)
        }
        if (lowFlag & 0x800) {
            outPacket.writeUInt8(settings.unk17)
        }
        if (lowFlag & 0x1000) {
            outPacket.writeUInt8(settings.unk18)
        }
        if (lowFlag & 0x2000) {
            outPacket.writeUInt8(settings.weaponRestrictions)
        }
        if (lowFlag & 0x4000) {
            outPacket.writeUInt8(settings.status)
        }
        if (lowFlag & 0x8000) {
            outPacket.writeUInt8(settings.unk21)
            outPacket.writeUInt8(settings.mapCycleType)
            outPacket.writeUInt8(settings.unk23)
            outPacket.writeUInt8(settings.unk24)
        }
        if (lowFlag & 0x10000) {
            outPacket.writeUInt8(settings.unk25)
        }
        if (lowFlag & 0x20000) {
            outPacket.writeUInt8(settings.multiMaps.length)
            for (const map of settings.multiMaps) {
                outPacket.writeUInt8(map)
            }
        }
        if (lowFlag & 0x40000) {
            outPacket.writeUInt8(settings.teamBalanceType)
        }
        if (lowFlag & 0x80000) {
            outPacket.writeUInt8(settings.unk29)
        }
        if (lowFlag & 0x100000) {
            outPacket.writeUInt8(settings.unk30)
        }
        if (lowFlag & 0x200000) {
            outPacket.writeUInt8(settings.unk31)
        }
        if (lowFlag & 0x400000) {
            outPacket.writeUInt8(settings.unk32)
        }
        if (lowFlag & 0x800000) {
            outPacket.writeUInt8(settings.unk33)
        }
        if (lowFlag & 0x1000000) {
            const botEnabled: number = settings.areBotsEnabled as unknown as number
            outPacket.writeUInt8(botEnabled)

            if (settings.areBotsEnabled === true) {
                outPacket.writeUInt8(settings.botDifficulty)
                outPacket.writeUInt8(settings.numCtBots)
                outPacket.writeUInt8(settings.numTrBots)
            }
        }

        if (lowFlag & 0x2000000) {
            outPacket.writeUInt8(settings.unk35)
        }

        if (lowFlag & 0x4000000) {
            outPacket.writeUInt8(settings.unk36)
        }

        if (lowFlag & 0x8000000) {
            outPacket.writeUInt8(settings.unk37)
        }

        if (lowFlag & 0x10000000) {
            outPacket.writeUInt8(settings.unk38)
        }

        if (lowFlag & 0x20000000) {
            outPacket.writeUInt8(settings.unk39)
        }

        if (lowFlag & 0x40000000) {
            outPacket.writeUInt8(settings.isIngame as unknown as number)
        }

        if (lowFlag & 0x80000000) {
            outPacket.writeUInt16(settings.startMoney)
        }

        if (highFlag & 0x1) {
            outPacket.writeUInt8(settings.changeTeams)
        }

        if (highFlag & 0x2) {
            outPacket.writeUInt8(settings.unk43)
        }

        if (highFlag & 0x4) {
            outPacket.writeUInt8(settings.hltvEnabled)
        }

        if (highFlag & 0x8) {
            outPacket.writeUInt8(settings.difficulty)
        }

        if (highFlag & 0x10) {
            outPacket.writeUInt8(settings.respawnTime)
        }
        /* tslint:enable: no-bitwise */
    }
}
