import { PacketString } from '../../packetstring'
import { OutPacketBase } from '../packet'

import { Channel } from '../../../channel'
import { ChannelServer } from '../../../channelserver'
import { ServerListChannelInfo } from './channelinfo'

/**
 * Sub structure of ServerList packet
 * Has information about a server and its channels
 * @class ServerListServerInfo
 */
export class ServerListServerInfo {
    private unk00: number
    private unk01: number
    private unk02: number
    private serverName: PacketString
    private channelCount: number
    private channels: ServerListChannelInfo[]

    constructor(channelServer: ChannelServer) {
        this.unk00 = 1
        this.unk01 = 1
        this.unk02 = 3
        this.serverName = new PacketString(channelServer.name)
        this.channelCount = channelServer.channels.length
        this.channels = []
        channelServer.channels.forEach((channel: Channel) => {
            this.channels.push(new ServerListChannelInfo(channel))
        });
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt8(this.unk00)
        outPacket.writeUInt8(this.unk01)
        outPacket.writeUInt8(this.unk02)
        outPacket.writeString(this.serverName)
        outPacket.writeUInt8(this.channelCount)
        this.channels.forEach((element: ServerListChannelInfo) => {
            element.build(outPacket)
        });
    }
}
