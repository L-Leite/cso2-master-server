import { BasePacketEvent } from './base';

import { PacketId } from '../packets/definitions';
import { InVersionPacket } from '../packets/in/version'
import { OutVersionPacket } from '../packets/out/version'

/**
 * handles the version packet
 * @class OnVersionPacket
 */
export class OnVersionPacket extends BasePacketEvent {
    /**
     * get the packet's id we are responsible for
     * @returns returns the id of the packet we handle
     */
    public static packetId(): PacketId {
        return PacketId.Version
    }
    /**
     * parses incoming packet's data
     * @returns true if successful, false otherwise
     */
    protected parseInPacket(): boolean {
        const versionPacket: InVersionPacket = new InVersionPacket(this.inData)
        console.log(this.socket.uuid + ' sent a version packet. clientHash: ' + versionPacket.clientHash)
        return true
    }

    /**
     * builds the reply to be sent to the socket
     * @returns the data to be sent to the socket
     */
    protected buildOutPacket(): Buffer {
        return new OutVersionPacket(
            false, '6246015df9a7d1f7311f888e7e861f18', this.socket.getSeq()).build()
    }
}
