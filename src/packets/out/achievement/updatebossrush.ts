import { OutPacketBase } from 'packets/out/packet'

/**
 * sends out the user's updated zombie rush boss data
 */
export class OutAchievementUpdateBossRush {
    public static build(outPacket: OutPacketBase): void {
        outPacket.writeUInt16(1) // id

        const flags = 0xFF
        outPacket.writeUInt32(flags)

        /* tslint:disable: no-bitwise */
        if (flags & 0x1) {
            outPacket.writeUInt16(0)
        }

        if (flags & 0x2) {
            outPacket.writeUInt32(0)
        }

        if (flags & 0x4) {
            outPacket.writeUInt16(0)
        }

        if (flags & 0x8) {
            outPacket.writeUInt16(0)
        }

        if (flags & 0x10) {
            outPacket.writeUInt32(0)
        }

        if (flags & 0x20) {
            outPacket.writeUInt32(0)
        }

        if (flags & 0x40) {
            const arrayLen = 0
            outPacket.writeUInt8(0)

            for (let i = 0; i < arrayLen; i++) {
                outPacket.writeUInt32(0)
                outPacket.writeUInt16(0)
                outPacket.writeUInt16(0)
            }
        }

        if (flags & 0x80) {
            outPacket.writeUInt16(0)
        }
        /* tslint:enable: no-bitwise */
    }
}
