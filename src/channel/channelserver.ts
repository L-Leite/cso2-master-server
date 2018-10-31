import { Channel } from 'channel/channel'

import { ExtendedSocket } from 'extendedsocket'
import { ServerInstance } from 'serverinstance'

/**
 * Represents a channel "server"
 * Stores its name and a list of channels
 * @class ChannelServer
 */
export class ChannelServer {
    private static nextChannelId = 1

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
    public index: number
    public channels: Channel[]

    constructor(serverName: string, serverIndex: number,
                totalServers: number, numOfChannels: number) {
        this.name = ChannelServer.formatServerName(serverName, serverIndex, totalServers)
        this.index = serverIndex
        this.channels = []

        for (let index = 0; index < numOfChannels; index++) {
            const newChannelIndex: number = ChannelServer.nextChannelId
            const newChannelName: string = ChannelServer.formatChannelName(
                serverName, serverIndex, newChannelIndex)

            this.channels.push(new Channel(newChannelIndex, newChannelName))

            ChannelServer.nextChannelId++
        }
    }

    /**
     * getChannelByIndex
     */
    public getChannelByIndex(index: number): Channel {
        for (const channel of this.channels) {
            if (channel.index === index) {
                return channel
            }
        }
        return null
    }
}
