import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { ChannelServer } from 'channel/channelserver'

import { ServerListServerInfo } from 'packets/out/serverlist/serverinfo'

import { ExtendedSocket } from 'extendedsocket'

/**
 * outgoing userstart packet
 * Structure:
 * [base packet]
 * [userId - 4 bytes]
 * [loginName - the length of the str + 1 byte]
 * [userName - the length of the str + 1 byte]
 * [unk00 - 1 byte]
 * [serverUdpPort - 2 bytes]
 * @class OutUserStartPacket
 */
export class OutServerListPacket extends OutPacketBase {
    private serverNum: number
    private servers: ServerListServerInfo[]
    constructor(channelServers: ChannelServer[], socket: ExtendedSocket) {
        super(socket, PacketId.ServerList)

        this.serverNum = channelServers.length
        this.servers = []
        for (const server of channelServers) {
            this.servers.push(new ServerListServerInfo(server))
        }
    }

    /**
     * builds the packet with data provided by us
     */
    public build(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 60, incrementAmount: 12 })

        this.buildHeader()
        this.writeUInt8(this.serverNum)
        for (const server of this.servers) {
            server.build(this)
        }

        return this.getData()
    }
}
