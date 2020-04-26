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
            console.warn(`user ID ${session.user.userId} sent a null chat message`)
            return false
        }

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

        console.warn('unknown chat packet type %i from user ID %i', chatPkt.type, session.user.userId)
        return false
    }

    private async OnChannelMessage(chatPkt: InChatPacket, conn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = conn.getSession()

        const curChannel: Channel = session.currentChannel

        if (curChannel == null) {
            console.warn(`user ID ${session.user.userId} sent a channel message without being in a channel`)
            return false
        }

        const outMsgData: OutChatPacket = OutChatPacket.channelMessage(
            session.user.playerName, chatPkt.message)

        curChannel.recurseUsers((c: ExtendedSocket) => {
            c.send(outMsgData)
        })

        console.log('user %i sent a channel message "%s" from channel "%s"',
        session.user.userId, chatPkt.message, curChannel.name)
        return true
    }

    private async OnDirectMessage(chatPkt: InChatPacket, conn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = conn.getSession()

        if (chatPkt.destination == null) {
            console.warn(`user ID ${session.user.userId} tried to send a direct message without destination`)
            return false
        }

        if (chatPkt.destination === session.user.playerName) {
            console.warn(`user ID ${session.user.userId} tried send a direct message to itself`)
            return false
        }

        const receiverConn: ExtendedSocket = ActiveConnections.Singleton().FindByPlayerName(chatPkt.destination)

        if (receiverConn == null) {
            console.warn(`couldn't find receiver ${chatPkt.destination} for user ID ${session.user.userId}'s direct message`)
            return false
        }

        const outMsgData: OutChatPacket = OutChatPacket.directMessage(
            session.user.playerName, chatPkt.message)

        conn.send(outMsgData)
        receiverConn.send(outMsgData)

        console.log('user ID %i sent a direct message "%s" to the user ID %i',
        session.user.userId, chatPkt.message, receiverConn.getSession().user.userId)
        return true
    }

    private async OnRoomMessage(chatPkt: InChatPacket, conn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = conn.getSession()

        if (session.isInRoom() === false) {
            console.warn(`user ID ${session.user.userId} sent a room message without being in a room`)
            return false
        }

        const curRoom: Room = session.currentRoom

        if (curRoom.getRoomUser(session.user.userId).isIngame === true) {
            console.warn(`user ID ${session.user.userId} sent a room message without being not ingame status`)
            return false
        }

        const outMsgData: OutChatPacket = OutChatPacket.roomMessage(
            session.user.playerName, null, chatPkt.message)

        curRoom.recurseUsers((u: RoomUserEntry) => {
            if (u.isIngame === false) {
                u.conn.send(outMsgData)
            }
        })

        console.log('user ID %i sent a room message "%s" from room "%s" (room id: %i)',
        session.user.userId, chatPkt.message, curRoom.settings.roomName, curRoom.id)
        return true
    }

    private async OnIngameGlobalMessage(chatPkt: InChatPacket, conn: ExtendedSocket): Promise<boolean> {
        const session: UserSession = conn.getSession()

        if (this.CanSendIngameMessage(session) === false) {
            return false
        }

        const curRoom: Room = session.currentRoom
        const ourRoomUser: RoomUserEntry = curRoom.getRoomUser(session.user.userId)

        const outMsgData: OutChatPacket = OutChatPacket.ingameMessage(
            session.user.playerName, ourRoomUser.team, chatPkt.message)

        curRoom.recurseUsers((u: RoomUserEntry) => {
            if (u.isIngame === true) {
                u.conn.send(outMsgData)
            }
        })

        console.log('user ID %i sent a ingame global message "%s" from room "%s" (room id: %i)',
        session.user.userId, chatPkt.message, curRoom.settings.roomName, curRoom.id)
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

        console.log('user ID %i sent a ingame team message "%s" from room "%s" (room id: %i)',
        session.user.userId, chatPkt.message, curRoom.settings.roomName, curRoom.id)
        return true
    }

    private CanSendIngameMessage(session: UserSession): boolean {
        if (session.isInRoom() === false) {
            console.warn(`user ID ${session.user.userId} sent a ingame message without being in a room`)
            return false
        }

        const curRoom: Room = session.currentRoom
        const roomUser: RoomUserEntry = curRoom.getRoomUser(session.user.userId)

        if (roomUser == null) {
            console.warn(`user ID ${session.user.userId} sent a ingame message without being in the correct room`)
            return false
        }

        if (roomUser.isIngame === false) {
            console.warn(`user ID ${session.user.userId} sent a ingame message without being ingame`)
            return false
        }

        return true
    }
}
