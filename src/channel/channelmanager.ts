import { ChannelServer } from 'channel/channelserver'

import { OutServerListPacket } from 'packets/out/serverlist'

/**
 * handles the channel logic
 * @class ChannelManager
 */
export class ChannelManager {
    private channelServers: ChannelServer[]
    constructor() {
        this.channelServers = [new ChannelServer('Test server', 1, 1, 1)]
    }
    public buildServerListPacket(seq: number): Buffer {
        const packet: OutServerListPacket =
            new OutServerListPacket(seq, this.channelServers)
        return packet.build()
    }
}
