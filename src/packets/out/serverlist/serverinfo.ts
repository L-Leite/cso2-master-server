import { OutPacketBase } from 'packets/out/packet'
import { PacketString } from 'packets/packetstring'

import { ChannelServer } from 'channel/channelserver'

import { ServerListChannelInfo } from 'packets/out/serverlist/channelinfo'

/**
 * sends out a channel server data to an user
 * @class ServerListServerInfo
 */
export class ServerListServerInfo {
    private serverIndex: number
    private serverStatus: number
    private serverType: number
    private serverName: PacketString
    private channelCount: number
    private channels: ServerListChannelInfo[]

    constructor(channelServer: ChannelServer) {
        this.serverIndex = 1
        this.serverStatus = 1
        this.serverType = 3
        this.serverName = new PacketString(channelServer.name)
        this.channelCount = channelServer.channels.length
        this.channels = []
        for (const channel of channelServer.channels) {
            this.channels.push(new ServerListChannelInfo(channel))
        }
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt8(this.serverIndex)
        outPacket.writeUInt8(this.serverStatus)
        outPacket.writeUInt8(this.serverType)
        outPacket.writeString(this.serverName)
        outPacket.writeUInt8(this.channelCount)
        for (const channel of this.channels) {
            channel.build(outPacket)
        }
    }
}
