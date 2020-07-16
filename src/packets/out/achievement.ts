import { WritableStreamBuffer } from 'stream-buffers'

import { AchievementPacketType, PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { OutAchievementUpdateCampaign } from 'packets/out/achievement/updatecampaign'

/**
 * creates achievement related packets
 */
export class OutAchievementPacket extends OutPacketBase {
    public static UpdateCampaign(): OutAchievementPacket {
        const packet: OutAchievementPacket = new OutAchievementPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 40,
            incrementAmount: 15
        })

        packet.buildHeader()
        packet.writeUInt8(AchievementPacketType.Campaign)

        OutAchievementUpdateCampaign.build(packet)

        return packet
    }

    constructor() {
        super(PacketId.Achievement)
    }
}
