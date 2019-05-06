import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { ChannelServer } from 'channel/channelserver'

import { OutChannelServerItem } from 'packets/out/serverlist/serveritem'

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
    constructor(channelServers: ChannelServer[]) {
        super(PacketId.ServerList)

        this.outStream = new WritableStreamBuffer(
            { initialSize: 60, incrementAmount: 12 })

        this.buildHeader()
        this.writeUInt8(channelServers.length)
        for (const server of channelServers) {
            new OutChannelServerItem(server).build(this)
        }
    }
}
