import { PacketString } from 'packets/packetstring'

import { OutPacketBase } from 'packets/out/packet'

import { NewRoomSettings } from 'room/newroomsettings'

/**
 * Sub structure of Room packet
 * @class OutRoomUpdateSettings
 */
export class OutRoomUpdateSettings {
    private settings: NewRoomSettings

    constructor(newSettings: NewRoomSettings) {
        this.settings = newSettings
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt64(this.settings.getFlags())

        // int64-buffer doesn't have bitwise operations,
        // so split it to two 32 bit values and use them instead
        const flagBuf: Buffer = this.settings.getFlags().toBuffer(true)
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
            outPacket.writeUInt8(this.settings.botEnabled)

            if (this.settings.botEnabled === 1) {
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
}
