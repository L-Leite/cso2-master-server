import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from '../definitions'
import { OutPacketBase } from './packet'

import { ChannelServer } from '../../channelserver'
import { ServerListServerInfo } from './serverlist/serverinfo'

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
    constructor(seq: number, channelServers: ChannelServer[]) {
        super()
        this.sequence = seq
        this.packetId = PacketId.ServerList

        this.serverNum = channelServers.length
        this.servers = []
        channelServers.forEach((server: ChannelServer) => {
            this.servers.push(new ServerListServerInfo(server))
        });
    }

    /**
     * builds the packet with data provided by us
     */
    public build(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 20, incrementAmount: 4 })

        this.buildHeader()
        this.writeUInt8(this.serverNum)
        this.servers.forEach((element: ServerListServerInfo) => {
            element.build(this)
        });

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }
}
