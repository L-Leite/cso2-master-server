import { OutPacketBase } from 'packets/out/packet'

/**
 * sends out the user's updated campaign data
 */
export class OutAchievementUpdateCampaign {
    public static build(campaignId: number, outPacket: OutPacketBase): void {
        outPacket.writeUInt16(campaignId)

        const flags = 0x7
        outPacket.writeUInt32(flags)

        if (flags & 0x1) {
            outPacket.writeUInt16(1)
        }

        if (flags & 0x2) {
            outPacket.writeUInt32(1)
        }

        if (flags & 0x4) {
            outPacket.writeUInt16(1)
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
    }
}
