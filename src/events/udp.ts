import * as ip from 'ip'

import { PacketId } from '../packets/definitions'
import { InUdpPacket } from '../packets/in/udp'
import { UserData } from '../userdata'
import { UserStorage } from '../userstorage'
import { BasePacketEvent } from './base'

/**
 * handles incoming udp packets
 * @class OnUdpPacket
 */
export class OnUdpPacket extends BasePacketEvent {
    /**
     * get the packet's id we are responsible for
     * @returns returns the id of the packet we handle
     */
    public static packetId(): PacketId {
        return PacketId.Udp
    }

    /**
     * parses incoming packet's data
     * @returns true if successful, false otherwise
     */
    protected parseInPacket(): boolean {
        const udpPacket: InUdpPacket = new InUdpPacket(this.inData)
        console.log(this.socket.uuid + ' sent an udp packet. ip:port: ' + udpPacket.ip + ':' + udpPacket.port)
        const user: UserData = UserStorage.getUserByUuid(this.socket.uuid)
        let newIp = ip.toLong(udpPacket.ip)
        newIp += 0x80800000
        user.externalIpAddress = ip.fromLong(newIp)
        user.port = udpPacket.port
        return true
    }

    /**
     * builds the reply to be sent to the socket
     * @returns the data to be sent to the socket
     */
    protected buildOutPacket(): Buffer {
        return Buffer.from([])
    }
}
