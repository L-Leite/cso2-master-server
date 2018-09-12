import { ExtendedSocket } from '../extendedsocket'
import { ServerManager } from '../servermanager'

import { PacketId } from '../packets/definitions'
import { OutHostPacket } from '../packets/out/host'
import { OutUdpPacket } from '../packets/out/udp'
import { RoomData } from '../roomdata'
import { RoomStorage } from '../roomstorage'
import { UserData } from '../userdata'
import { UserStorage } from '../userstorage'
import { BasePacketEvent } from './base'

/**
 * handles the room packet
 * @class OnRoomPacket
 */
export class OnRoomPacket extends BasePacketEvent {
    /**
     * get the packet's id we are responsible for
     * @returns returns the id of the packet we handle
     */
    public static packetId(): PacketId {
        return PacketId.Room
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
        // when the match start is requested
        if (this.inData[5] === 0x13) {
            const room: RoomData = RoomStorage.getRoom(1)
            const host: UserData = UserStorage.getUserByUuid(this.socket.uuid)

            let guestsUdpData: Buffer = Buffer.from([])

            room.users.forEach((element) => {
                if (element.userId !== host.userId) {
                    const guestSocket: ExtendedSocket = ServerManager.getSocketByUuid(element.uuid)
                    const hostUdpData: Buffer = new OutUdpPacket(1, host.userId,
                        host.externalIpAddress, host.localServerPort, guestSocket.getSeq()).build()
                    const guestReply: Buffer = new OutHostPacket(guestSocket.getSeq()).joinHost(host.userId)
                    guestsUdpData = Buffer.concat([guestsUdpData, new OutUdpPacket(0, element.userId,
                        element.externalIpAddress, element.localClientPort, this.socket.getSeq()).build()])
                    ServerManager.getSocketByUuid(element.uuid).write(Buffer.concat([hostUdpData, guestReply]))
                }
            });

            const matchStart: Buffer =
                new OutHostPacket(this.socket.getSeq()).gameStart(host.userId)
            return Buffer.concat([guestsUdpData, matchStart])
        }
        return Buffer.from([])
    }
}
