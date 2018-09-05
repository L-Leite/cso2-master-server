import * as hexy from 'hexy'

import { ExtendedSocket } from './extendedsocket'

import { BasePacketCallback } from './callbacks/base';
import { RoomPacketCallback } from './callbacks/room';
import { UserPacketCallback } from './callbacks/user';
import { VersionPacketCallback } from './callbacks/version';
import { PacketId } from './packets/definitions'
import { IncomingPacket } from './packets/incoming/packet'

type PacketCallback = (socket: ExtendedSocket, inData: Buffer) => Buffer

/**
 * Parses the incoming packets and callbacks their respective type
 * @class PacketManager
 */
export class PacketManager {
    /**
     * parses received packet data from a socket
     * @param socket - the socket from where the data originated
     * @param data - the data received to parse
     */
    public static handlePacket(socket: ExtendedSocket, data: Buffer): Buffer {
        const packet = new IncomingPacket(data)

        // make sure we're handling with a packet
        if (packet.isValid() === false) {
            console.log('this packet is invalid')
            return null
        }

        if (this.packetCallbacks.has(packet.id) === false) {
            console.log('unknown packet id ' + packet.id + ' from ' + socket.uuid)
            return null
        }

        // get the packet callback from our map
        const callback: BasePacketCallback = this.packetCallbacks.get(packet.id).get()

        console.log('packet from ' + socket.uuid +
            ' sequence: ' + packet.sequence +
            ' length: ' + packet.length)

        // call the callback
        const res: Buffer = callback.onCallback(socket, data)
        console.log('wrote this packet ' + packet.id + ' to ' + socket.uuid)
        console.log(hexy.hexy(res))

        return res
    }

    /**
     * store our callbacks
     */
    private static packetCallbacks: Map<PacketId, typeof BasePacketCallback> = new Map(
        [
            [PacketId.Login, UserPacketCallback as typeof BasePacketCallback],
            [PacketId.Room, RoomPacketCallback as typeof BasePacketCallback],
            [PacketId.Version, VersionPacketCallback as typeof BasePacketCallback],
        ])
}
