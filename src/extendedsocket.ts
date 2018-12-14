import net from 'net'

import { PacketLogger } from 'packetlogger'

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
    // the current packet sequence
    private seq: number
    private packetDumper: PacketLogger

    /**
     * returns the current sequence and increments it
     */
    public getSeq(): number {
        // don't overflow the sequence
        if (this.seq > MAX_SEQUENCE) {
            this.resetReq()
        }

        return this.seq++
    }

    /**
     * get the current sequence for the packet logger
     * TODO: find a better way to do this
     */
    public loggerGetSeq(): number {
        return this.seq
    }

    /** sets the sequence to the start */
    public resetReq(): void {
        this.seq = 1
    }

    /**
     * a write method overload that logs the out data
     * @param buffer the data to write
     */
    public send(buffer: Buffer): boolean {
        if (this.packetDumper) {
            this.packetDumper.dumpOut(buffer, this)
        }

        return super.write(buffer)
    }
}
