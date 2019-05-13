import net from 'net'

import { PacketLogger } from 'packetlogger'
import { OutPacketBase } from 'packets/out/packet'

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

        newSocket.ownerId = 0
        newSocket.realSeq = MIN_SEQUENCE
        newSocket.packetDumper = packetDumper

        return newSocket
    }

    // an uuid to identify the socket
    public uuid: string
    // the connection owning user, null if it doesn't have any
    private ownerId: number
    // the current packet sequence (1 byte long)
    private seq: number
    // the real current packet sequence, used by logger
    private realSeq: number
    private packetDumper: PacketLogger

    /**
     * returns the socket's owning user's ID if available
     * if it doesn't have any owner, it returns null
     */
    public getOwner() {
        return this.ownerId
    }

    /**
     * checks if the socket has an owning user
     * @returns true if it has, false if not
     */
    public hasOwner(): boolean {
        return this.getOwner() !== 0
    }

    /**
     * sets the socket's owning user
     * @param newOwnerId the new owner's user ID
     */
    public setOwner(newOwnerId: number): void {
        this.ownerId = newOwnerId
    }

    /**
     * returns the current sequence and increments it
     */
    public getNextSeq(): number {
        // don't overflow the sequence
        if (this.seq > MAX_SEQUENCE) {
            this.resetReq()
        }

        return this.seq++
    }

    /**
     * get the current real sequence
     */
    public getRealSeq(): number {
        return this.realSeq++
    }

    /**
     * sets the sequence to the start
     */
    public resetReq(): void {
        this.seq = MIN_SEQUENCE
    }

    /**
     * send a packet over to this connection
     * @param packet the packet to be sent
     * @returns true if successful, false if not
     */
    public send(packet: OutPacketBase): boolean {
        if (this.destroyed === true) {
            console.warn('ExtendedSocket::send: tried to send with a broken socket. This is most likely a bug')
            return false
        }

        const data: Buffer = packet.getData()
        data.writeUInt8(this.getNextSeq(), 1)

        if (this.packetDumper) {
            this.packetDumper.dumpOut(this.uuid, this.realSeq, packet.id, data)
        }

        return super.write(data)
    }

    /**
     * send a buffer over to this connection
     * TODO: remove this once the Unlock packet is reversed
     * @param buff the buffer to be sent
     */
    public sendBuffer(buff: Buffer): boolean {
        if (this.destroyed === true) {
            console.warn('ExtendedSocket::sendBuffer: tried to send with a broken socket. This is most likely a bug')
            return false
        }

        buff.writeUInt8(this.getNextSeq(), 1)

        /*if (this.packetDumper) {
            this.packetDumper.dumpOut(buff, this)
        }*/

        return super.write(buff)
    }
}
