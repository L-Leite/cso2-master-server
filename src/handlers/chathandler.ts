import { ExtendedSocket } from 'extendedsocket'
import { UserSession } from 'user/usersession'

import { ChatMessageType } from 'packets/definitions'
import { ChatService } from 'services/chatservice'

import { Channel } from 'channel/channel'
import { Room } from 'room/room'
import { RoomUserEntry } from 'room/roomuserentry'

import { InChatPacket } from 'packets/in/chat'
import { OutChatPacket } from 'packets/out/chat'

import { ActiveConnections } from 'storage/activeconnections'

/**
 * handles incoming Chat packets
 */
export class ChatHandler {
    private chatSvc: ChatService

    constructor(chatSvc: ChatService) {
        this.chatSvc = chatSvc
    }

    public async OnPacket(packetData: Buffer, conn: ExtendedSocket): Promise<boolean> {
        const chatPkt: InChatPacket = new InChatPacket(packetData)

        const session: UserSession = conn.getSession()

        if (conn.hasSession() === false) {
            console.warn(`connection ${conn.uuid} sent an chat packet without a session`)
            return false
        }

        if (chatPkt.message == null) {
            console.warn(`user ${session.user.userId} sent a null room message`)
            return false
        }

        console.debug(`"${session.user.userName} said "${chatPkt.message}" to type ${chatPkt.type} (destination: ${chatPkt.destination})`)

        switch (chatPkt.type) {
            case ChatMessageType.DirectMessage:
                return this.OnDirectMessage(chatPkt, conn)
            case ChatMessageType.Channel:
                return this.OnChannelMessage(chatPkt, conn)
            case ChatMessageType.Room:
                return this.OnRoomMessage(chatPkt, conn)
            case ChatMessageType.IngameGlobal:
                return this.OnIngameGlobalMessage(chatPkt, conn)
            case ChatMessageType.IngameTeam:
                return this.OnIngameTeamMessage(chatPkt, conn)
        }

        return false
    }

    private async OnChannelMessage(chatPkt: InChatPacket, conn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = conn.getSession()

        const curChannel: Channel = session.currentChannel

        if (curChannel == null) {
            console.warn(`user ${session.user.userId} sent a channel message without being in a channel`)
            return false
        }

        const outMsgData: OutChatPacket = OutChatPacket.channelMessage(
            session.user.playerName, chatPkt.message)

        curChannel.recurseUsers((c: ExtendedSocket) => {
            c.send(outMsgData)
        })

        return true
    }

    private async OnDirectMessage(chatPkt: InChatPacket, conn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = conn.getSession()

        if (chatPkt.destination == null) {
            console.warn(`user ${session.user.userId} sent a direct message without destination`)
            return false
        }

        const receiverConn: ExtendedSocket = ActiveConnections.Singleton().FindByPlayerName(chatPkt.destination)

        if (receiverConn == null) {
            console.warn(`couldn't find receiver ${chatPkt.destination} for user ${session.user.userId}'s direct message`)
            return false
        }

        const outMsgData: OutChatPacket = OutChatPacket.directMessage(
            session.user.playerName, chatPkt.message)

        conn.send(outMsgData)
        receiverConn.send(outMsgData)

        return true
    }

    private async OnRoomMessage(chatPkt: InChatPacket, conn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = conn.getSession()

        if (session.isInRoom() === false) {
            console.warn(`user ${session.user.userId} sent a room message without being in a room`)
            return false
        }

        const curRoom: Room = session.currentRoom
        const outMsgData: OutChatPacket = OutChatPacket.roomMessage(
            session.user.playerName, null, chatPkt.message)

        curRoom.recurseUsers((u: RoomUserEntry) => {
            if (u.isIngame === false) {
                u.conn.send(outMsgData)
            }
        })

        return true
    }

    private async OnIngameGlobalMessage(chatPkt: InChatPacket, conn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = conn.getSession()

        if (this.CanSendIngameMessage(session) === false) {
            return false
        }

        const curRoom: Room = session.currentRoom
        const ourRoomUser: RoomUserEntry = curRoom.getRoomUser(session.user.userId)

        const outMsgData: OutChatPacket = OutChatPacket.ingameTeamMessage(
            session.user.playerName, ourRoomUser.team, chatPkt.message)

        curRoom.recurseUsers((u: RoomUserEntry) => {
            if (u.isIngame === true) {
                u.conn.send(outMsgData)
            }
        })

        return true
    }

    private async OnIngameTeamMessage(chatPkt: InChatPacket, conn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = conn.getSession()

        if (this.CanSendIngameMessage(session) === false) {
            return false
        }

        const curRoom: Room = session.currentRoom
        const ourRoomUser: RoomUserEntry = curRoom.getRoomUser(session.user.userId)

        const outMsgData: OutChatPacket = OutChatPacket.ingameTeamMessage(
            session.user.playerName, ourRoomUser.team, chatPkt.message)

        curRoom.recurseUsers((u: RoomUserEntry) => {
            if (u.isIngame === true && u.team === ourRoomUser.team) {
                u.conn.send(outMsgData)
            }
        })

        return true
    }

    private CanSendIngameMessage(session: UserSession): boolean {
        if (session.isInRoom() === false) {
            console.warn(`user ${session.user.userId} sent an ingame message without being in a room`)
            return false
        }

        const curRoom: Room = session.currentRoom
        const roomUser: RoomUserEntry = curRoom.getRoomUser(session.user.userId)

        if (roomUser == null) {
            console.warn(`user ${session.user.userId} sent an ingame message without being in the correct room`)
            return false
        }

        if (roomUser.isIngame === false) {
            console.warn(`user ${session.user.userId} sent an ingame message without being ingame`)
            return false
        }

        return true
    }
}
