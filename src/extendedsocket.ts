import * as net from 'net';

/**
 * Expands net.Socket with more socket information
 * @class ExtendedSocket
 */
export class ExtendedSocket extends net.Socket {
    public static from(socket: net.Socket): ExtendedSocket {
        const newSocket: ExtendedSocket = new ExtendedSocket()
        Object.assign(newSocket, socket)
        return newSocket
    }
    /**
     * an uuid to identify the socket
     */
    public uuid: string
    /**
     * the current packet sequence
     */
    private seq: number

    /**
     * returns the current sequence and increments it
     */
    public getSeq(): number {
        return this.seq++
    }

    public initSeq(): void {
        this.seq = 1
    }
}
