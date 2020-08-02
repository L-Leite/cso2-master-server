import { InPacketBase } from 'packets/in/packet'

import { AboutmePacketType } from 'packets/definitions'

/**
 * handles the user's profile settings requests
 */
export class InAboutmePacket extends InPacketBase {
    public packetType: AboutmePacketType

    /**
     * parses the packet's data
     */
    protected parse(): void {
        super.parse()

        this.packetType = this.readUInt8()
    }
}
