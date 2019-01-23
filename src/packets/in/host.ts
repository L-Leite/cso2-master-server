import { InPacketBase } from 'packets/in/packet'

import { HostPacketType } from 'packets/hostshared'

/**
 * incoming host packet
 * @class InHostPacket
 */
export class InHostPacket extends InPacketBase {
    public packetType: HostPacketType

    /**
     * parses the packet's data
     */
    protected parse(): void {
        super.parse()

        this.packetType = this.readUInt8()
    }
}
