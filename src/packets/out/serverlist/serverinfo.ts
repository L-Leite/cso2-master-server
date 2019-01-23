import { OutPacketBase } from 'packets/out/packet'
import { PacketString } from 'packets/packetstring'

import { ChannelServer } from 'channel/channelserver'

import { ServerListChannelInfo } from 'packets/out/serverlist/channelinfo'

/**
 * sends out a channel server data to an user
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
        for (const channel of channelServer.channels) {
            this.channels.push(new ServerListChannelInfo(channel))
        }
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt8(this.unk00)
        outPacket.writeUInt8(this.unk01)
        outPacket.writeUInt8(this.unk02)
        outPacket.writeString(this.serverName)
        outPacket.writeUInt8(this.channelCount)
        for (const channel of this.channels) {
            channel.build(outPacket)
        }
    }
}
