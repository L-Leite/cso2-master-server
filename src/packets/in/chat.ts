import { InPacketBase } from 'packets/in/packet'

import { ChatMessageType } from 'packets/definitions'

/**
 * chat packet sent by the client
 */
export class InChatPacket extends InPacketBase {
    public type: ChatMessageType
    public message: string

    /**
     * parses the packet's data
     */
    protected parse(): void {
        super.parse()
        this.type = this.readUInt8()
        this.message = this.readLongString()
    }
}
