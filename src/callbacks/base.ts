import { ExtendedSocket } from '../extendedsocket';

/**
 * Base implementation of a packet callback
 * @class BasePacketCallback
 */
export abstract class BasePacketCallback {

    public static get(): BasePacketCallback {
        return Object.create(this.prototype)
    }
    /**
     * the client's socket
     */
    protected socket: ExtendedSocket
    /**
     * the data received by the client's socket
     */
    protected inData: Buffer

    /**
     * called when a packet is received
     * @param socket - the data owner's socket
     * @param inData - the data sent by the socket
     * @returns the data to be sent to the socket
     */
    public onCallback(socket: ExtendedSocket, inData: Buffer): Buffer {
        this.socket = socket
        this.inData = inData
        this.parseInPacket()
        return this.buildOutPacket()
    }

    /**
     * parses incoming packet's data
     * @returns true if successful, false otherwise
     */
    protected abstract parseInPacket(): boolean

    /**
     * builds the reply to be sent to the socket
     * @returns the data to be sent to the socket
     */
    protected abstract buildOutPacket(): Buffer
}
