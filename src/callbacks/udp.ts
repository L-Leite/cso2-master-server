import { IncomingUdpPacket } from '../packets/incoming/udp';
import { UserData } from '../userdata';
import { UserStorage } from '../userstorage';
import { BasePacketCallback } from './base';

/**
 * handles the version packet
 * @class UdpPacketCallback
 */
export class UdpPacketCallback extends BasePacketCallback {
    /**
     * parses incoming packet's data
     * @returns true if successful, false otherwise
     */
    protected parseInPacket(): boolean {
        const udpPacket: IncomingUdpPacket = new IncomingUdpPacket(this.inData)
        console.log(this.socket.uuid + ' sent an udp packet. ip:port: ' + udpPacket.ip + ':' + udpPacket.port)
        const user: UserData = UserStorage.getUser(udpPacket.id)
        user.ip = udpPacket.ip
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
