import { Channel } from './channel'

/**
 * Represents a channel "server"
 * Stores its name and a list of channels
 * @class ChannelServer
 */
export class ChannelServer {
    private static currentServerId = 0

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
            const newChannelId: number = ChannelServer.currentServerId + 1
            const newChannelName: string = ChannelServer.formatChannelName(
                serverName, serverIndex, newChannelId)

            this.channels.push(new Channel(newChannelId, newChannelName))

            ChannelServer.currentServerId++
        }
    }
}
