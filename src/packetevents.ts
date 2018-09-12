import * as hexy from 'hexy'

import { ExtendedSocket } from './extendedsocket'

import { InPacketBase } from './packets/in/packet'

import { OnAutomatchPacket } from './events/automatch'
import { BasePacketEvent } from './events/base'
import { OnLoginPacket } from './events/login'
import { OnRoomPacket } from './events/room'
import { OnUdpPacket } from './events/udp'
import { OnVersionPacket } from './events/version'

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
        const packet = new InPacketBase(data)

        // make sure we're handling with a packet
        if (packet.isValid() === false) {
            console.log('this packet is invalid')
            return null
        }

        if (this.events.has(packet.packetId) === false) {
            console.log('unknown packet id ' + packet.packetId + ' from ' + socket.uuid)
            return null
        }

        // create a new packet even object
        const callback: BasePacketEvent = this.events.get(packet.packetId).new()

        console.log('packet from ' + socket.uuid + ' seq: ' + packet.sequence + ' length: ' + packet.length)

        // call the callback
        const res: Buffer = callback.onCallback(socket, data)
        console.log('wrote packet ' + packet.packetId + ' to ' + socket.uuid)
        console.log(hexy.hexy(res))

        return res
    }

    /**
     * store our events
     */
    private static events: Map<number, typeof BasePacketEvent> = new Map(
        [
            [OnVersionPacket.packetId(), OnVersionPacket as typeof BasePacketEvent],
            [OnLoginPacket.packetId(), OnLoginPacket as typeof BasePacketEvent],
            [OnRoomPacket.packetId(), OnRoomPacket as typeof BasePacketEvent],
            [OnUdpPacket.packetId(), OnUdpPacket as typeof BasePacketEvent],
            [OnAutomatchPacket.packetId(), OnAutomatchPacket as typeof BasePacketEvent],
        ])
}
