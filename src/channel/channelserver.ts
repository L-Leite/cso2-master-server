import { Channel } from 'channel/channel'

import { ExtendedSocket } from 'extendedsocket'
import { ServerInstance } from 'serverinstance'

/**
 * Represents a channel "server"
 * Stores its name and a list of channels
 * @class ChannelServer
 */
export class ChannelServer {
    private static currentServerId = 1

    private static formatServerName(serverName: string,
                                    serverIndex: number,
                                    totalServers: number): string {
        return serverName + ' [' + serverIndex + '/' + totalServers + ']'
    }

    private static formatChannelName(serverName: string,
                                     serverIndex: number,
                                     channelIndex: number): string {
        return serverName + ' ' + serverIndex + '-' + channelIndex
    }

    public name: string
    public channels: Channel[]

    constructor(serverName: string, serverIndex: number,
                totalServers: number, numOfChannels: number) {
        this.name = ChannelServer.formatServerName(serverName, serverIndex, totalServers)
        this.channels = []

        for (let index = 0; index < numOfChannels; index++) {
            const newChannelId: number = ChannelServer.currentServerId
            const newChannelName: string = ChannelServer.formatChannelName(
                serverName, serverIndex, newChannelId)

            this.channels.push(new Channel(newChannelId, newChannelName))

            ChannelServer.currentServerId++
        }
    }

    public onRoomListPacket(data: Buffer, sourceSocket: ExtendedSocket, server: ServerInstance): boolean {
        return true
    }
}
