import { ChannelServer } from 'channel/channelserver'

import { ExtendedSocket } from 'extendedsocket'

import { OutServerListPacket } from 'packets/out/serverlist'

import { UserManager } from 'user/usermanager'

/**
 * handles the channels logic
 * @class ChannelManager
 */
export class ChannelManager {
    private channelServers: ChannelServer[]
    constructor() {
        this.channelServers = [new ChannelServer('Test server', 1, 1, 1)]
    }

    public onChannelListPacket(sourceSocket: ExtendedSocket, users: UserManager): boolean {
        if (users.isUuidLoggedIn(sourceSocket.uuid) === false) {
            console.log('uuid ' + sourceSocket.uuid + ' tried to get channels without session')
            return false
        }

        sourceSocket.write(this.buildServerListPacket(sourceSocket.getSeq()))
        return true
    }

    public buildServerListPacket(seq: number): Buffer {
        const packet: OutServerListPacket =
            new OutServerListPacket(seq, this.channelServers)
        return packet.build()
    }
}
