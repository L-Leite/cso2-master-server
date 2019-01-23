import { Uint64LE } from 'int64-buffer'

import { InPacketBase } from 'packets/in/packet'

/**
 * a host's request to change a room's settings
 * @class InRoomUpdateSettings
 */
export class InRoomUpdateSettings {
    public flags: Uint64LE
    public roomName: string
    public unk00: number
    public unk01: number
    public unk02: number
    public unk03: number
    // flags & 0x8
    public unk09: string
    // end of flags & 0x8
    // flags & 0x10
    public unk10: number
    // end of flags & 0x10
    // flags & 0x20
    public forceCamera: number
    // end of flags & 0x20
    // flags & 0x40
    public gameModeId: number
    // end of flags & 0x40
    // flags & 0x80
    public mapId: number
    public unk13: number
    // end of flags & 0x80
    // flags & 0x100
    public maxPlayers: number
    // end of flags & 0x100
    // flags & 0x200
    public winLimit: number
    // end of flags & 0x200
    // flags & 0x400
    public killLimit: number
    // end of flags & 0x400
    // flags & 0x800
    public unk17: number
    // end of flags & 0x800
    // flags & 0x1000
    public unk18: number
    // end of flags & 0x1000
    // flags & 0x2000
    public weaponRestrictions: number
    // end of flags & 0x2000
    // flags & 0x4000
    public unk20: number
    // end of flags & 0x4000
    // flags & 0x8000
    public unk21: number
    public mapCycleType: number
    public unk23: number
    public unk24: number
    // end of flags & 0x8000
    // flags & 0x10000
    public unk25: number
    // end of flags & 0x10000
    // flags & 0x20000
    public numOfMultiMaps: number
    public multiMaps: number[]
    // end of flags & 0x20000
    // flags & 0x40000
    public teamBalance: number
    // end of flags & 0x40000
    // flags & 0x80000
    public unk29: number
    // end of flags & 0x80000
    // flags & 0x100000
    public unk30: number
    // end of flags & 0x100000
    // flags & 0x20000
    public unk31: number
    // end of flags & 0x200000
    // flags & 0x400000
    public unk32: number
    // end of flags & 0x400000
    // flags & 0x800000
    public unk33: number
    // end of flags & 0x800000
    // flags & 0x1000000
    public botEnabled: number // if == 1, it can have 3 more bytes
    public botDifficulty: number
    public numCtBots: number
    public numTrBots: number
    // end of flags & 0x1000000
    // flags & 0x2000000
    public unk35: number
    // end of flags & 0x2000000
    // flags & 0x4000000
    public unk36: number
    // end of flags & 0x4000000
    // flags & 0x8000000
    public unk37: number
    // end of flags & 0x8000000
    // flags & 0x10000000
    public unk38: number
    // end of flags & 0x10000000
    // flags & 0x20000000
    public unk39: number
    // end of flags & 0x20000000
    // flags & 0x40000000
    public unk40: number
    // end of flags & 0x40000000
    // flags & 0x80000000
    public startMoney: number
    // end of flags & 0x80000000
    // flags & 0x100000000
    public changeTeams: number
    // end of flags & 0x100000000
    // flags & 0x200000000
    public unk43: number
    // end of flags & 0x200000000
    // flags & 0x400000000
    public hltvEnabled: number
    // end of flags & 0x400000000
    // flags & 0x800000000
    public unk45: number
    // end of flags & 0x800000000
    // flags & 0x1000000000
    public respawnTime: number
    // end of flags & 0x1000000000

    constructor(inPacket: InPacketBase) {
        if (inPacket == null) {
            return
        }

        this.flags = inPacket.readUInt64()

        // int64-buffer doesn't have bitwise operations,
        // so split it to two 32 bit values and use them instead
        const flagBuf: Buffer = this.flags.toBuffer(true)
        const lowFlag = flagBuf.readUInt32LE(0)
        const highFlag = flagBuf.readUInt32LE(4)

        // disable linter bitwise restrictions so we can check the flags
        /* tslint:disable: no-bitwise */
        if (lowFlag & 0x1) {
            this.roomName = inPacket.readString()
        }
        if (lowFlag & 0x2) {
            this.unk00 = inPacket.readUInt8()
        }
        if (lowFlag & 0x4) {
            this.unk01 = inPacket.readUInt8()
            this.unk02 = inPacket.readUInt32()
            this.unk03 = inPacket.readUInt32()
        }
        if (lowFlag & 0x8) {
            this.unk09 = inPacket.readString()
        }
        if (lowFlag & 0x10) {
            this.unk10 = inPacket.readUInt16()
        }
        if (lowFlag & 0x20) {
            this.forceCamera = inPacket.readUInt8()
        }
        if (lowFlag & 0x40) {
            this.gameModeId = inPacket.readUInt8()
        }
        if (lowFlag & 0x80) {
            this.mapId = inPacket.readUInt8()
            this.unk13 = inPacket.readUInt8()
        }
        if (lowFlag & 0x100) {
            this.maxPlayers = inPacket.readUInt8()
        }
        if (lowFlag & 0x200) {
            this.winLimit = inPacket.readUInt8()
        }
        if (lowFlag & 0x400) {
            this.killLimit = inPacket.readUInt16()
        }
        if (lowFlag & 0x800) {
            this.unk17 = inPacket.readUInt8()
        }
        if (lowFlag & 0x1000) {
            this.unk18 = inPacket.readUInt8()
        }
        if (lowFlag & 0x2000) {
            this.weaponRestrictions = inPacket.readUInt8()
        }
        if (lowFlag & 0x4000) {
            this.unk20 = inPacket.readUInt8()
        }
        if (lowFlag & 0x8000) {
            this.unk21 = inPacket.readUInt8()
            this.mapCycleType = inPacket.readUInt8()
            this.unk23 = inPacket.readUInt8()
            this.unk24 = inPacket.readUInt8()
        }
        if (lowFlag & 0x10000) {
            this.unk25 = inPacket.readUInt8()
        }
        if (lowFlag & 0x20000) {
            this.numOfMultiMaps = inPacket.readUInt8()
            this.multiMaps = []
            for (let i = 0; i < this.numOfMultiMaps; i++) {
                this.multiMaps[i] = inPacket.readUInt8()
            }
        }
        if (lowFlag & 0x40000) {
            this.teamBalance = inPacket.readUInt8()
        }
        if (lowFlag & 0x80000) {
            this.unk29 = inPacket.readUInt8()
        }
        if (lowFlag & 0x100000) {
            this.unk30 = inPacket.readUInt8()
        }
        if (lowFlag & 0x200000) {
            this.unk31 = inPacket.readUInt8()
        }
        if (lowFlag & 0x400000) {
            this.unk32 = inPacket.readUInt8()
        }
        if (lowFlag & 0x800000) {
            this.unk33 = inPacket.readUInt8()
        }
        if (lowFlag & 0x1000000) {
            this.botEnabled = inPacket.readUInt8()

            if (this.botEnabled === 1) {
                this.botDifficulty = inPacket.readUInt8()
                this.numCtBots = inPacket.readUInt8()
                this.numTrBots = inPacket.readUInt8()
            }
        }

        if (lowFlag & 0x2000000) {
            this.unk35 = inPacket.readUInt8()
        }

        if (lowFlag & 0x4000000) {
            this.unk36 = inPacket.readUInt8()
        }

        if (lowFlag & 0x8000000) {
            this.unk37 = inPacket.readUInt8()
        }

        if (lowFlag & 0x10000000) {
            this.unk38 = inPacket.readUInt8()
        }

        if (lowFlag & 0x20000000) {
            this.unk39 = inPacket.readUInt8()
        }

        if (lowFlag & 0x40000000) {
            this.unk40 = inPacket.readUInt8()
        }

        if (lowFlag & 0x80000000) {
            this.startMoney = inPacket.readUInt16()
        }

        if (highFlag & 0x1) {
            this.changeTeams = inPacket.readUInt8()
        }

        if (highFlag & 0x2) {
            this.unk43 = inPacket.readUInt8()
        }

        if (highFlag & 0x4) {
            this.hltvEnabled = inPacket.readUInt8()
        }

        if (highFlag & 0x8) {
            this.unk45 = inPacket.readUInt8()
        }

        if (highFlag & 0x10) {
            this.respawnTime = inPacket.readUInt8()
        }
        /* tslint:enable: no-bitwise */
    }
}
