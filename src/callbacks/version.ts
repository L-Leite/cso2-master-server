import { BasePacketCallback } from './base';

import { ExtendedSocket } from '../extendedsocket';
import { IncomingVersionPacket } from '../packets/incoming/version'
import { OutgoingVersionPacket } from '../packets/outgoing/version'

/**
 * handles the version packet
 * @class VersionCallback
 */
export class VersionPacketCallback extends BasePacketCallback {
    /**
     * parses incoming packet's data
     * @returns true if successful, false otherwise
     */
    protected parseInPacket(): boolean {
        const versionPacket: IncomingVersionPacket = new IncomingVersionPacket(this.inData)
        console.log(this.socket.uuid + ' sent a version packet. clientHash: ' + versionPacket.clientHash)
        return true
    }

    /**
     * builds the reply to be sent to the socket
     * @returns the data to be sent to the socket
     */
    protected buildOutPacket(): Buffer {
        return new OutgoingVersionPacket(
            false, '6246015df9a7d1f7311f888e7e861f18', this.socket.getSeq()).build()
    }
}
