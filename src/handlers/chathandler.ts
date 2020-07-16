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

    public OnPacket(packetData: Buffer, conn: ExtendedSocket): boolean {
        const chatPkt: InChatPacket = new InChatPacket(packetData)

        const session: UserSession = conn.session

        if (session == null) {
            console.warn(
                `connection ${conn.uuid} sent an chat packet without a session`
            )
            return false
        }

        if (
            chatPkt.message == null ||
            chatPkt.length === 0 ||
            chatPkt.message[0] === '\0'
        ) {
            console.warn(`user ID ${session.user.id} sent a null chat message`)
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

        console.warn(
            'unknown chat packet type %i from user ID %i',
            chatPkt.type,
            session.user.id
        )
        return false
    }

    private OnChannelMessage(
        chatPkt: InChatPacket,
        conn: ExtendedSocket
    ): boolean {
        const session: UserSession = conn.session

        const curChannel: Channel = session.currentChannel

        if (curChannel == null) {
            console.warn(
                `user ID ${session.user.id} sent a channel message without being in a channel`
            )
            return false
        }

        const outMsgData: OutChatPacket = OutChatPacket.channelMessage(
            session.user.playername,
            session.user.gm,
            chatPkt.message
        )

        curChannel.recurseUsers((c: ExtendedSocket) => {
            c.send(outMsgData)
        })

        return true
    }

    private OnDirectMessage(
        chatPkt: InChatPacket,
        conn: ExtendedSocket
    ): boolean {
        const session: UserSession = conn.session

        if (chatPkt.destination == null) {
            console.warn(
                `user ID ${session.user.id} tried to send a direct message without destination`
            )
            return false
        }

        if (chatPkt.destination === session.user.playername) {
            console.warn(
                `user ID ${session.user.id} tried send a direct message to itself`
            )
            return false
        }

        const receiverConn: ExtendedSocket = ActiveConnections.Singleton().FindByPlayerName(
            chatPkt.destination
        )

        if (receiverConn == null) {
            console.warn(
                `couldn't find receiver ${chatPkt.destination} for user ID ${session.user.id}'s direct message`
            )
            return false
        }

        const targetsession: UserSession = receiverConn.session

        const outMsgData: OutChatPacket = OutChatPacket.directMessage(
            session.user.playername,
            session.user.vip_level,
            targetsession.user.gm,
            targetsession.user.playername,
            false,
            chatPkt.message
        )
        conn.send(outMsgData)

        const outMsgDataOfTarget: OutChatPacket = OutChatPacket.directMessage(
            session.user.playername,
            session.user.vip_level,
            session.user.gm,
            targetsession.user.playername,
            true,
            chatPkt.message
        )
        receiverConn.send(outMsgDataOfTarget)

        return true
    }

    private OnRoomMessage(
        chatPkt: InChatPacket,
        conn: ExtendedSocket
    ): boolean {
        const session: UserSession = conn.session

        if (session.isInRoom() === false) {
            console.warn(
                `user ID ${session.user.id} sent a room message without being in a room`
            )
            return false
        }

        const curRoom: Room = session.currentRoom

        if (curRoom.getRoomUser(session.user.id).isIngame === true) {
            console.warn(
                `user ID ${session.user.id} sent a room message without being non-ingame status`
            )
            return false
        }

        const outMsgData: OutChatPacket = OutChatPacket.roomMessage(
            session.user.playername,
            session.user.vip_level,
            session.user.gm,
            chatPkt.message
        )

        curRoom.recurseUsers((u: RoomUserEntry) => {
            if (u.isIngame === false) {
                u.conn.send(outMsgData)
            }
        })

        return true
    }

    private OnIngameGlobalMessage(
        chatPkt: InChatPacket,
        conn: ExtendedSocket
    ): boolean {
        const session: UserSession = conn.session

        if (this.CanSendIngameMessage(session) === false) {
            return false
        }

        const curRoom: Room = session.currentRoom

        const outMsgData: OutChatPacket = OutChatPacket.ingameMessage(
            session.user.playername,
            session.user.vip_level,
            session.user.gm,
            chatPkt.message
        )

        curRoom.recurseUsers((u: RoomUserEntry) => {
            if (u.isIngame === true) {
                u.conn.send(outMsgData)
            }
        })

        return true
    }

    private OnIngameTeamMessage(
        chatPkt: InChatPacket,
        conn: ExtendedSocket
    ): boolean {
        const session: UserSession = conn.session

        if (this.CanSendIngameMessage(session) === false) {
            return false
        }

        const curRoom: Room = session.currentRoom
        const ourRoomUser: RoomUserEntry = curRoom.getRoomUser(session.user.id)

        const outMsgData: OutChatPacket = OutChatPacket.ingameTeamMessage(
            session.user.playername,
            session.user.vip_level,
            session.user.gm,
            chatPkt.message
        )

        curRoom.recurseUsers((u: RoomUserEntry) => {
            if (u.isIngame === true && u.team === ourRoomUser.team) {
                u.conn.send(outMsgData)
            }
        })

        return true
    }

    private CanSendIngameMessage(session: UserSession): boolean {
        if (session.isInRoom() === false) {
            console.warn(
                `user ID ${session.user.id} sent a ingame message without being in a room`
            )
            return false
        }

        const curRoom: Room = session.currentRoom
        const roomUser: RoomUserEntry = curRoom.getRoomUser(session.user.id)

        if (roomUser == null) {
            console.warn(
                `user ID ${session.user.id} sent a ingame message without being in the correct room`
            )
            return false
        }

        if (roomUser.isIngame === false) {
            console.warn(
                `user ID ${session.user.id} sent a ingame message without being ingame`
            )
            return false
        }

        return true
    }
}
