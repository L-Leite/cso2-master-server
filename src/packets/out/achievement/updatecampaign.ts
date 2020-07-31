import { OutPacketBase } from 'packets/out/packet'

export interface OutAchUpdCampaignItem {
    itemId: number
    ammount: number
    timeLimited: boolean
}

export interface OutAchUpdCampaignOptions {
    unk?: number
    unk2?: number
    rewardTitle?: number
    rewardIcon?: number
    rewardPoints?: number
    rewardXp?: number
    rewardItems?: OutAchUpdCampaignItem[]
    unk3?: number
}

/**
 * sends out the user's updated campaign data
 */
export class OutAchievementUpdateCampaign {
    public static build(
        campaignId: number,
        outPacket: OutPacketBase,
        options: OutAchUpdCampaignOptions = {}
    ): void {
        outPacket.writeUInt16(campaignId)

        const flags = this.getFlagsFor(options)
        outPacket.writeUInt32(flags)

        if (flags & 0x1) {
            outPacket.writeUInt16(options.unk) // unused?
        }

        if (flags & 0x2) {
            outPacket.writeUInt32(options.unk2) // unused?
        }

        if (flags & 0x4) {
            outPacket.writeUInt16(options.rewardTitle)
        }

        if (flags & 0x8) {
            outPacket.writeUInt16(options.rewardIcon)
        }

        if (flags & 0x10) {
            outPacket.writeUInt32(options.rewardPoints)
        }

        if (flags & 0x20) {
            outPacket.writeUInt32(options.rewardXp)
        }

        if (flags & 0x40) {
            outPacket.writeUInt8(options.rewardItems.length)

            for (const item of options.rewardItems) {
                outPacket.writeUInt32(item.itemId)
                outPacket.writeUInt16(item.ammount)
                outPacket.writeUInt16(item.timeLimited ? 1 : 0)
            }
        }

        if (flags & 0x80) {
            outPacket.writeUInt16(options.unk3) // unused?
        }
    }

    private static getFlagsFor(options: OutAchUpdCampaignOptions): number {
        let outFlags = 0

        if (options.unk != null) {
            outFlags |= 0x1
        }

        if (options.unk2 != null) {
            outFlags |= 0x2
        }

        if (options.rewardTitle != null) {
            outFlags |= 0x4
        }

        if (options.rewardIcon != null) {
            outFlags |= 0x8
        }

        if (options.rewardPoints != null) {
            outFlags |= 0x10
        }

        if (options.rewardXp != null) {
            outFlags |= 0x20
        }

        if (options.rewardItems != null) {
            outFlags |= 0x40
        }

        if (options.unk3 != null) {
            outFlags |= 0x80
        }

        return outFlags
    }
}
