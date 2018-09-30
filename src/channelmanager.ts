import { ChannelServer } from './channelserver'

import { OutServerListPacket } from './packets/out/serverlist'

/**
 * stores the channel "servers"
 * @class ChannelManager
 */
export class ChannelManager {
    public static buildAsPacket(seq: number): Buffer {
        const packet: OutServerListPacket =
            new OutServerListPacket(seq, this.channelServers)
        return packet.build()
    }
    private static channelServers: ChannelServer[] =
        [new ChannelServer('Test server', 1, 1, 1)]
}
