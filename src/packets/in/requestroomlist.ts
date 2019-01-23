import { InPacketBase } from 'packets/in/packet'

/**
 * an user's request for a channel's rooms
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
