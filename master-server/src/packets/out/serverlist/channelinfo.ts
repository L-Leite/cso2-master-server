import { OutPacketBase } from 'packets/out/packet'

import { Channel } from 'channel/channel'

/**
 * sends out a channel info to an user
 * @class ServerListChannelInfo
 */
export class ServerListChannelInfo {
    private id: number
    private name: string
    private unk00: number
    private unk01: number
    private unk02: number
    private ChannelType: number
    private ChannelStatus: number

    constructor(channel: Channel) {
        this.id = channel.index
        this.name = channel.name
        this.unk00 = 4
        this.unk01 = 0x1f4
        this.unk02 = 1
        this.ChannelType = 0
        this.ChannelStatus = 1
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt8(this.id)
        outPacket.writeString(this.name)
        outPacket.writeUInt16(this.unk00)
        outPacket.writeUInt16(this.unk01)
        outPacket.writeUInt8(this.unk02)
        outPacket.writeUInt8(this.ChannelType)
        outPacket.writeUInt8(this.ChannelStatus)
    }
}
