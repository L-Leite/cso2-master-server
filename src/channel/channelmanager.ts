import { ChannelServer } from 'channel/channelserver'
import { Channel } from './channel'

import { ExtendedSocket } from 'extendedsocket'

import { OutServerListPacket } from 'packets/out/serverlist'

import { UserManager } from 'user/usermanager'

import { InRequestRoomList } from 'packets/in/requestroomlist'
import { OutLobbyPacket } from 'packets/out/lobby'
import { OutRoomListPacket } from 'packets/out/roomlist'

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

        const reply: Buffer = this.buildServerListPacket(sourceSocket.getSeq())
        sourceSocket.write(reply)
        return true
    }

    public onRoomListPacket(reqData: Buffer, sourceSocket: ExtendedSocket, users: UserManager): boolean {
        if (users.isUuidLoggedIn(sourceSocket.uuid) === false) {
            console.log('uuid ' + sourceSocket.uuid + ' tried to get rooms without session')
            return false
        }

        const reqPacket: InRequestRoomList = new InRequestRoomList(reqData)

        const server: ChannelServer = this.getServerByIndex(reqPacket.channelServerIndex)

        if (server == null) {
            return false
        }

        const channel: Channel = server.getChannelByIndex(reqPacket.channelIndex)

        if (channel == null) {
            return false
        }

        const lobbyReply: Buffer = new OutLobbyPacket(sourceSocket.getSeq()).doSomething()
        const roomListReply: Buffer = new OutRoomListPacket(sourceSocket.getSeq()).getFullList(channel.rooms)
        sourceSocket.write(lobbyReply)
        sourceSocket.write(roomListReply)

        return true
    }

    public buildServerListPacket(seq: number): Buffer {
        const packet: OutServerListPacket =
            new OutServerListPacket(seq, this.channelServers)
        return packet.build()
    }

    private getServerByIndex(index: number): ChannelServer {
        for (const server of this.channelServers) {
            if (server.index === index) {
                return server
            }
        }
        return null
    }
}
