import { InPacketBase } from 'packets/in/packet'

/**
 * incoming roomlist request packet
 * @class InRequestRoomListPacket
 */
export class InRequestRoomListPacket extends InPacketBase {
    public channelServerIndex: number
    public channelIndex: number

    /**
     * parses the packet's data
     */
    protected parse(): void {
        super.parse()
        this.channelServerIndex = this.readUInt8()
        this.channelIndex = this.readUInt8()
    }
}
