import { InPacketBase } from 'packets/in/packet'

import { OptionPacketType } from 'packets/optionshared'

/**
 * incoming option packet
 */
export class InOptionPacket extends InPacketBase {
    public packetType: OptionPacketType

    /**
     * parses the packet's data
     */
    protected parse(): void {
        super.parse()

        this.packetType = this.readUInt8()
    }
}
