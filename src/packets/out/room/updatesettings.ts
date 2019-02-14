import { Uint64LE } from 'int64-buffer'

import { PacketString } from 'packets/packetstring'

import { OutPacketBase } from 'packets/out/packet'

import { RoomSettings } from 'room/roomsettings'

/**
 * sends out any updated room's settings
 * @class OutRoomUpdateSettings
 */
export class OutRoomUpdateSettings {
    private settings: RoomSettings

    constructor(newSettings: RoomSettings) {
        this.settings = newSettings
    }

    public build(outPacket: OutPacketBase): void {
        const flags: Uint64LE = this.getFlags()

        outPacket.writeUInt64(flags)

        // int64-buffer doesn't have bitwise operations,
        // so split it to two 32 bit values and use them instead
        const flagBuf: Buffer = flags.toBuffer(true)
        const lowFlag = flagBuf.readUInt32LE(0)
        const highFlag = flagBuf.readUInt32LE(4)

        // disable linter bitwise restrictions so we can check the flags
        /* tslint:disable: no-bitwise */
        if (lowFlag & 0x1) {
            outPacket.writeString(new PacketString(this.settings.roomName))
        }
        if (lowFlag & 0x2) {
            outPacket.writeUInt8(this.settings.unk00)
        }
        if (lowFlag & 0x4) {
            outPacket.writeUInt8(this.settings.unk01)
            outPacket.writeUInt32(this.settings.unk02)
            outPacket.writeUInt32(this.settings.unk03)
        }
        if (lowFlag & 0x8) {
            outPacket.writeString(new PacketString(this.settings.unk09))
        }
        if (lowFlag & 0x10) {
            outPacket.writeUInt16(this.settings.unk10)
        }
        if (lowFlag & 0x20) {
            outPacket.writeUInt8(this.settings.forceCamera)
        }
        if (lowFlag & 0x40) {
            outPacket.writeUInt8(this.settings.gameModeId)
        }
        if (lowFlag & 0x80) {
            outPacket.writeUInt8(this.settings.mapId)
            outPacket.writeUInt8(this.settings.unk13)
        }
        if (lowFlag & 0x100) {
            outPacket.writeUInt8(this.settings.maxPlayers)
        }
        if (lowFlag & 0x200) {
            outPacket.writeUInt8(this.settings.winLimit)
        }
        if (lowFlag & 0x400) {
            outPacket.writeUInt16(this.settings.killLimit)
        }
        if (lowFlag & 0x800) {
            outPacket.writeUInt8(this.settings.unk17)
        }
        if (lowFlag & 0x1000) {
            outPacket.writeUInt8(this.settings.unk18)
        }
        if (lowFlag & 0x2000) {
            outPacket.writeUInt8(this.settings.weaponRestrictions)
        }
        if (lowFlag & 0x4000) {
            outPacket.writeUInt8(this.settings.unk20)
        }
        if (lowFlag & 0x8000) {
            outPacket.writeUInt8(this.settings.unk21)
            outPacket.writeUInt8(this.settings.mapCycleType)
            outPacket.writeUInt8(this.settings.unk23)
            outPacket.writeUInt8(this.settings.unk24)
        }
        if (lowFlag & 0x10000) {
            outPacket.writeUInt8(this.settings.unk25)
        }
        if (lowFlag & 0x20000) {
            outPacket.writeUInt8(this.settings.multiMaps.length)
            for (const map of this.settings.multiMaps) {
                outPacket.writeUInt8(map)
            }
        }
        if (lowFlag & 0x40000) {
            outPacket.writeUInt8(this.settings.teamBalanceType)
        }
        if (lowFlag & 0x80000) {
            outPacket.writeUInt8(this.settings.unk29)
        }
        if (lowFlag & 0x100000) {
            outPacket.writeUInt8(this.settings.unk30)
        }
        if (lowFlag & 0x200000) {
            outPacket.writeUInt8(this.settings.unk31)
        }
        if (lowFlag & 0x400000) {
            outPacket.writeUInt8(this.settings.unk32)
        }
        if (lowFlag & 0x800000) {
            outPacket.writeUInt8(this.settings.unk33)
        }
        if (lowFlag & 0x1000000) {
            const botEnabled: number = this.settings.areBotsEnabled as unknown as number
            outPacket.writeUInt8(botEnabled)

            if (this.settings.areBotsEnabled === true) {
                outPacket.writeUInt8(this.settings.botDifficulty)
                outPacket.writeUInt8(this.settings.numCtBots)
                outPacket.writeUInt8(this.settings.numTrBots)
            }
        }

        if (lowFlag & 0x2000000) {
            outPacket.writeUInt8(this.settings.unk35)
        }

        if (lowFlag & 0x4000000) {
            outPacket.writeUInt8(this.settings.unk36)
        }

        if (lowFlag & 0x8000000) {
            outPacket.writeUInt8(this.settings.unk37)
        }

        if (lowFlag & 0x10000000) {
            outPacket.writeUInt8(this.settings.unk38)
        }

        if (lowFlag & 0x20000000) {
            outPacket.writeUInt8(this.settings.unk39)
        }

        if (lowFlag & 0x40000000) {
            outPacket.writeUInt8(this.settings.unk40)
        }

        if (lowFlag & 0x80000000) {
            outPacket.writeUInt16(this.settings.startMoney)
        }

        if (highFlag & 0x1) {
            outPacket.writeUInt8(this.settings.changeTeams)
        }

        if (highFlag & 0x2) {
            outPacket.writeUInt8(this.settings.unk43)
        }

        if (highFlag & 0x4) {
            outPacket.writeUInt8(this.settings.hltvEnabled)
        }

        if (highFlag & 0x8) {
            outPacket.writeUInt8(this.settings.unk45)
        }

        if (highFlag & 0x10) {
            outPacket.writeUInt8(this.settings.respawnTime)
        }
        /* tslint:enable: no-bitwise */
    }

    public getFlags(): Uint64LE {
        let lowFlag: number = 0
        let highFlag: number = 0

        /* tslint:disable: no-bitwise */
        if (this.settings.roomName != null) {
            lowFlag |= 0x1
        }
        if (this.settings.unk00 != null) {
            lowFlag |= 0x2
        }
        if (this.settings.unk01 != null && this.settings.unk02 != null && this.settings.unk03 != null) {
            lowFlag |= 0x4
        }
        if (this.settings.unk09 != null) {
            lowFlag |= 0x8
        }
        if (this.settings.unk10 != null) {
            lowFlag |= 0x10
        }
        if (this.settings.forceCamera != null) {
            lowFlag |= 0x20
        }
        if (this.settings.gameModeId != null) {
            lowFlag |= 0x40
        }
        if (this.settings.mapId != null && this.settings.unk13 != null) {
            lowFlag |= 0x80
        }
        if (this.settings.maxPlayers != null) {
            lowFlag |= 0x100
        }
        if (this.settings.winLimit != null) {
            lowFlag |= 0x200
        }
        if (this.settings.killLimit != null) {
            lowFlag |= 0x400
        }
        if (this.settings.unk17 != null) {
            lowFlag |= 0x800
        }
        if (this.settings.unk18 != null) {
            lowFlag |= 0x1000
        }
        if (this.settings.weaponRestrictions != null) {
            lowFlag |= 0x2000
        }
        if (this.settings.unk20 != null) {
            lowFlag |= 0x4000
        }
        if (this.settings.unk21 != null
            && this.settings.mapCycleType != null
            && this.settings.unk23 != null
            && this.settings.unk24 != null) {
            lowFlag |= 0x8000
        }
        if (this.settings.unk25 != null) {
            lowFlag |= 0x10000
        }
        if (this.settings.multiMaps != null) {
            lowFlag |= 0x20000
        }
        if (this.settings.teamBalanceType != null) {
            lowFlag |= 0x40000
        }
        if (this.settings.unk29 != null) {
            lowFlag |= 0x80000
        }
        if (this.settings.unk30 != null) {
            lowFlag |= 0x100000
        }
        if (this.settings.unk31 != null) {
            lowFlag |= 0x200000
        }
        if (this.settings.unk32 != null) {
            lowFlag |= 0x400000
        }
        if (this.settings.unk33 != null) {
            lowFlag |= 0x800000
        }
        if (this.settings.areBotsEnabled != null) {
            lowFlag |= 0x1000000
        }

        if (this.settings.unk35 != null) {
            lowFlag |= 0x2000000
        }

        if (this.settings.unk36 != null) {
            lowFlag |= 0x4000000
        }

        if (this.settings.unk37 != null) {
            lowFlag |= 0x8000000
        }

        if (this.settings.unk38 != null) {
            lowFlag |= 0x10000000
        }

        if (this.settings.unk39 != null) {
            lowFlag |= 0x20000000
        }

        if (this.settings.unk40 != null) {
            lowFlag |= 0x40000000
        }

        if (this.settings.startMoney != null) {
            lowFlag |= 0x80000000
        }

        if (this.settings.changeTeams != null) {
            highFlag |= 0x1
        }

        if (this.settings.unk43 != null) {
            highFlag |= 0x2
        }

        if (this.settings.hltvEnabled != null) {
            highFlag |= 0x4
        }

        if (this.settings.unk45 != null) {
            highFlag |= 0x8
        }

        if (this.settings.respawnTime != null) {
            highFlag |= 0x10
        }
        /* tslint:enable: no-bitwise */

        const flags: Uint64LE = new Uint64LE(highFlag, lowFlag)
        return flags
    }
}
