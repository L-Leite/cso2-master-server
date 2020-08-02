import { InPacketBase } from 'packets/in/packet'

import { AchievementPacketType } from 'packets/definitions'

/**
 * handles achievement related requests
 */
export class InAchievementPacket extends InPacketBase {
    public packetType: AchievementPacketType

    /**
     * parses the packet's data
     */
    protected parse(): void {
        super.parse()

        this.packetType = this.readUInt8()
    }
}
