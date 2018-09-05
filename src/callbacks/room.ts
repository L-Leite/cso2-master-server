import { ExtendedSocket } from '../extendedsocket';
import { OutgoingHostPacket } from '../packets/outgoing/host';
import { RoomData } from '../roomdata';
import { RoomStorage } from '../roomstorage';
import { ServerManager } from '../servermanager';
import { UserData } from '../userdata';
import { UserStorage } from '../userstorage';
import { BasePacketCallback } from './base';

/**
 * handles the room packet
 * @class VersionCallback
 */
export class RoomPacketCallback extends BasePacketCallback {
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

            room.players.forEach((element) => {
                if (element.userId !== host.userId) {
                    const guestSocket: ExtendedSocket = ServerManager.getSocketByUuid(element.uuid)
                    const guestReply: Buffer = new OutgoingHostPacket(guestSocket.getSeq()).joinHost(host.userId)
                    ServerManager.getSocketByUuid(element.uuid).write(guestReply)
                }
            });

            const matchStart: Buffer =
                new OutgoingHostPacket(this.socket.getSeq()).gameStart(host.userId)
            return matchStart
        }
        return Buffer.from([])
    }
}
