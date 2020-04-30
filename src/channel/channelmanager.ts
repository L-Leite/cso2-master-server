import { Channel } from 'channel/channel'
import { ChannelServer } from 'channel/channelserver'

import { ExtendedSocket } from 'extendedsocket'

import { InRequestRoomListPacket } from 'packets/in/requestroomlist'
import { OutLobbyPacket } from 'packets/out/lobby'
import { OutRoomListPacket } from 'packets/out/roomlist'
import { OutServerListPacket } from 'packets/out/serverlist'

import { UserSession } from 'user/usersession'

import { RoomHandler } from 'handlers/roomhandler'

// TODO: move to ChannelManager once it's not static
const roomHandler: RoomHandler = new RoomHandler()

/**
 * stores the channel servers and processes their data
 * @class ChannelManager
 */
export class ChannelManager {
    /**
     * called when the user sends a RequestChannels packet
     * @param sourceConn the user's socket
     */
    public static async onChannelListPacket(sourceConn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = sourceConn.session

        if (session == null) {
            console.warn(`uuid ${sourceConn.uuid} tried to get channels without a session`)
            return false
        }

        console.log(`user ID ${session.user.userId} requested server list` )
        this.sendChannelListTo(sourceConn)

        return true
    }

    /**
     * called when the user sends a RequestRoomList packet
     * @param packetData the packet's data
     * @param sourceSocket the user's socket
     * @param users the user manager object
     */
    public static async onRoomListPacket(packetData: Buffer, sourceConn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = sourceConn.session

        if (session == null) {
            console.warn('uuid ' + sourceConn.uuid + ' tried to get rooms without a session')
            return false
        }

        const listReq: InRequestRoomListPacket = new InRequestRoomListPacket(packetData)

        const server: ChannelServer = ChannelManager.getServerByIndex(listReq.channelServerIndex)

        if (server == null) {
            console.warn('user ID %i requested room list, but it isn\'t in a channel server', session.user.userId)
            return false
        }

        const channel: Channel = server.getChannelByIndex(listReq.channelIndex)

        if (channel == null) {
            console.warn('user ID %i requested room list, but it isn\'t in a channel', session.user.userId)
            return false
        }

        console.log('user "%s" requested room list successfully, sending it...', session.user.userId)
        await this.setUserChannel(sourceConn, channel)

        return true
    }

    public static async onRoomRequest(reqData: Buffer, sourceConn: ExtendedSocket): Promise<boolean> {
        return roomHandler.onRoomRequest(reqData, sourceConn)
    }

    /**
     * send the channel servers list data for an user's connection
     * @param conn the target user's connection
     */
    public static sendChannelListTo(conn: ExtendedSocket): void {
        conn.send(new OutServerListPacket(this.channelServers))
    }

    /**
     * get a channel server by its index
     * @param index the server index
     */
    public static getServerByIndex(index: number): ChannelServer {
        for (const server of this.channelServers) {
            if (server.index === index) {
                return server
            }
        }
        return null
    }

    public static async sendRoomListTo(conn: ExtendedSocket, channel: Channel): Promise<void> {
        conn.send(OutLobbyPacket.joinRoom())
        conn.send(await OutRoomListPacket.getFullList(channel.rooms))
    }

    private static channelServers: ChannelServer[] = [new ChannelServer('Test server', 1, 1, 1)]

    /**
     * sets an user's current channel
     * @param conn the target user's connection
     * @param channel the target channel
     */
    private static async setUserChannel(conn: ExtendedSocket, channel: Channel): Promise<void> {
        const session: UserSession = conn.session

        if (session.currentChannel != null) {
            channel.OnUserLeft(conn)
        }

        session.currentChannel = channel
        channel.OnUserJoined(conn)
        this.sendRoomListTo(conn, channel)
    }
}
