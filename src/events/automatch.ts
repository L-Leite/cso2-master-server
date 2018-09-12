import { ServerManager } from '../servermanager'
import { BasePacketEvent } from './base'

import { ExtendedSocket } from '../extendedsocket'
import { PacketId } from '../packets/definitions'
import { OutRoomPacket } from '../packets/out/room'
import { RoomData } from '../roomdata'
import { RoomStorage } from '../roomstorage'
import { UserData } from '../userdata'
import { UserStorage } from '../userstorage'

let curRoomId = 1
let curRoom: RoomData = null

/**
 * handles the automatch packet
 * @class OnAutomatchPacket
 */
export class OnAutomatchPacket extends BasePacketEvent {
    /**
     * get the packet's id we are responsible for
     * @returns returns the id of the packet we handle
     */
    public static packetId(): PacketId {
        return PacketId.Automatch
    }

    /**
     * parses incoming packet's data
     * @returns true if successful, false otherwise
     */
    protected parseInPacket(): boolean {
        return true
    }

    /**
     * builds the reply to be sent to the socket
     * @returns the data to be sent to the socket
     */
    protected buildOutPacket(): Buffer {
        // temporarily host a room
        if (curRoom == null) {
            const host: UserData = UserStorage.getUser(1)
            curRoom = RoomStorage.addRoom(curRoomId++, 'test room', host.userId, 2, 5, 5, 100)

            curRoom.addUser(host)

            const roomReply: Buffer = new OutRoomPacket(this.socket.getSeq())
                .createAndJoinRoom(curRoom)

            return roomReply
        } else {
            const guest: UserData = UserStorage.getUser(2)
            curRoom.addUser(guest)

            const roomReply: Buffer = new OutRoomPacket(this.socket.getSeq())
                .createAndJoinRoom(curRoom)

            const hostUser: UserData = UserStorage.getUser(curRoom.hostId)
            const hostSocket: ExtendedSocket =
                ServerManager.getSocketByUuid(hostUser.uuid)

            // const udpReply: Buffer =
            //    new OutgoingUdpPacket(0, this.newUserData.userId, this.newUserData.ip,
            //        this.newUserData.port, this.socket.getSeq()).build()

            const roomReply2: Buffer = new OutRoomPacket(hostSocket.getSeq())
                .newPlayerJoinRoom(guest)
            hostSocket.write(roomReply2)

            // const udpReply2: Buffer =
            //    new OutgoingUdpPacket(1, hostUser.userId, hostUser.ip, hostUser.port, hostSocket.getSeq()).build()

            return roomReply
        }
    }
}
