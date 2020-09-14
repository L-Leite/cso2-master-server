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
    public static onChannelListPacket(sourceConn: ExtendedSocket): boolean {
        const session: UserSession = sourceConn.session

        if (session == null) {
            console.warn(
                `uuid ${sourceConn.uuid} tried to get channels without a session`
            )
            return false
        }

        console.log(`user ID ${session.user.id} requested server list`)
        this.sendChannelListTo(sourceConn)

        return true
    }

    /**
     * called when the user sends a RequestRoomList packet
     * @param packetData the packet's data
     * @param sourceSocket the user's socket
     * @param users the user manager object
     */
    public static onRoomListPacket(
        packetData: Buffer,
        sourceConn: ExtendedSocket
    ): boolean {
        const session: UserSession = sourceConn.session

        if (session == null) {
            console.warn(
                'uuid ' +
                    sourceConn.uuid +
                    ' tried to get rooms without a session'
            )
            return false
        }

        const listReq: InRequestRoomListPacket = new InRequestRoomListPacket(
            packetData
        )

        const server: ChannelServer = ChannelManager.getServerByIndex(
            listReq.channelServerIndex
        )

        if (server == null) {
            console.warn(
                `user ID ${session.user.id} requested room list, but it isn't in a channel server`
            )
            return false
        }

        const channel: Channel = server.getChannelByIndex(listReq.channelIndex)

        if (channel == null) {
            console.warn(
                `user ID ${session.user.id} requested room list, but it isn't in a channel`
            )
            return false
        }

        console.log(
            `user ${session.user.id} requested room list successfully, sending it...`
        )
        this.setUserChannel(sourceConn, channel)

        return true
    }

    public static onRoomRequest(
        reqData: Buffer,
        sourceConn: ExtendedSocket
    ): boolean {
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

    public static sendRoomListTo(conn: ExtendedSocket, channel: Channel): void {
        conn.send(OutLobbyPacket.joinRoom())
        conn.send(OutRoomListPacket.getFullList(channel.rooms))
    }

    private static channelServers: ChannelServer[] = [
       new ChannelServer('Normal Server', 1, 1, 1),
       new ChannelServer('Normal Server', 1, 2, 2),
       new ChannelServer('Normal Server', 1, 3, 3)
    ]

    /**
     * sets an user's current channel
     * @param conn the target user's connection
     * @param channel the target channel
     */
    private static setUserChannel(
        conn: ExtendedSocket,
        channel: Channel
    ): void {
        const session: UserSession = conn.session

        if (session.currentChannel != null) {
            channel.OnUserLeft(conn)
        }

        session.currentChannel = channel
        channel.OnUserJoined(conn)
        this.sendRoomListTo(conn, channel)
    }
}
