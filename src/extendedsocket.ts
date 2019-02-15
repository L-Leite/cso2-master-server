import net from 'net'

import { PacketLogger } from 'packetlogger'

const MIN_SEQUENCE: number = 0
const MAX_SEQUENCE: number = 255

/**
 * Expands net.Socket with more socket information
 * @class ExtendedSocket
 */
export class ExtendedSocket extends net.Socket {
    public static from(socket: net.Socket, packetDumper: PacketLogger): ExtendedSocket {
        const newSocket: ExtendedSocket = new ExtendedSocket()
        Object.assign(newSocket, socket)
        newSocket.packetDumper = packetDumper
        return newSocket
    }

    // an uuid to identify the socket
    public uuid: string
    // the current packet sequence (1 byte long)
    private seq: number
    // the real current packet sequence, used by logger
    private realSeq: number
    private packetDumper: PacketLogger

    /**
     * returns the current sequence and increments it
     */
    public getNextSeq(): number {
        // don't overflow the sequence
        if (this.seq > MAX_SEQUENCE) {
            this.resetReq()
        }

        this.realSeq++
        return this.seq++
    }

    /**
     * get the current sequence
     */
    public getCurSeq(): number {
        return this.seq
    }

    /**
     * get the current real sequence
     */
    public getRealSeq(): number {
        return this.realSeq
    }

    /**
     * sets the sequence to the start
     */
    public resetReq(): void {
        this.seq = MIN_SEQUENCE
    }

    /**
     * a write method overload that logs the out data
     * @param buffer the data to write
     */
    public send(buffer: Buffer): boolean {
        if (this.destroyed === true) {
            console.warn('ExtendedSocket::send: tried to send with a broken socket. This is most likely a bug')
            return
        }

        if (this.packetDumper) {
            this.packetDumper.dumpOut(buffer, this)
        }

        return super.write(buffer)
    }
}
