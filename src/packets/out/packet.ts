import { Int64BE, Int64LE, Uint64BE, Uint64LE } from 'int64-buffer'
import { WritableStreamBuffer } from 'stream-buffers'

import { PacketBaseShared } from 'packets/packetbaseshared'

import { PacketId, PacketSignature } from 'packets/definitions'
import { PacketLongString } from 'packets/packetlongstring'
import { PacketString } from 'packets/packetstring'

import { ExtendedSocket } from 'extendedsocket'

/**
 * The outgoing TCP packet's base
 * Same as the incoming TCP packet base
 * Structure:
 * [signature - 1 byte]
 * [sequence - 1 byte]
 * [length - 2 bytes]
 * [packetId - 1 byte] - this is technically not part
 *                 of the base packet
 * @class OutPacketBase
 */
export abstract class OutPacketBase extends PacketBaseShared {
    protected outStream: WritableStreamBuffer

    constructor(socket: ExtendedSocket, id: PacketId) {
        super()
        this.sequence = socket.getNextSeq()
        this.id = id
    }

    /**
     * calculate the packet size, write it to the packet header
     * and then return the packet's data
     * @returns the new packet's data
     */
    public getData(): Buffer {
        const newPacket: Buffer = this.outStream.getContents()
        const dataLen: number = newPacket.byteLength - OutPacketBase.headerLength
        newPacket.writeUInt16LE(dataLen, 2)
        return newPacket
    }

    /**
     * writes a signed byte to the end of the packet's stream buffer
     * @param val the signed byte to write
     */
    public writeInt8(val: number): void {
        const buf: Buffer = new Buffer(1)
        buf.writeInt8(val as number, 0)
        this.outStream.write(buf)
    }

    /**
     * writes 2 signed bytes to the end of the packet's stream buffer
     * @param val the signed 2 bytes to write
     * @param littleEndian should the bytes be written in little endian?
     */
    public writeInt16(val: number, littleEndian: boolean = true): void {
        const buf: Buffer = new Buffer(2)
        if (littleEndian) {
            buf.writeInt16LE(val as number, 0)
        } else {
            buf.writeInt16BE(val as number, 0)
        }
        this.outStream.write(buf)
    }

    /**
     * writes 4 signed bytes to the end of the packet's stream buffer
     * @param val the signed 4 bytes to write
     * @param littleEndian should the bytes be written in little endian?
     */
    public writeInt32(val: number, littleEndian: boolean = true): void {
        const buf: Buffer = new Buffer(4)
        if (littleEndian) {
            buf.writeInt32LE(val as number, 0)
        } else {
            buf.writeInt32BE(val as number, 0)
        }
        this.outStream.write(buf)
    }

    /**
     * writes 8 signed bytes to the end of the packet's stream buffer
     * @param val the signed 8 bytes to write
     * @param littleEndian should the bytes be written in little endian?
     */
    public writeInt64(val: Int64LE | Int64BE, littleEndian: boolean = true): void {
        let buf: Buffer = null
        if (littleEndian) {
            buf = (val as Int64LE).toBuffer()
        } else {
            buf = (val as Int64BE).toBuffer()
        }
        this.outStream.write(buf)
    }

    /**
     * writes an unsigned byte to the end of the packet's stream buffer
     * @param val the unsigned byte to write
     */
    public writeUInt8(val: number): void {
        const buf: Buffer = new Buffer(1)
        buf.writeUInt8(val as number, 0)
        this.outStream.write(buf)
    }

    /**
     * writes 2 unsigned bytes to the end of the packet's stream buffer
     * @param val the unsigned 2 bytes to write
     * @param littleEndian should the bytes be written in little endian?
     */
    public writeUInt16(val: number, littleEndian: boolean = true): void {
        const buf: Buffer = new Buffer(2)
        if (littleEndian) {
            buf.writeUInt16LE(val as number, 0)
        } else {
            buf.writeUInt16BE(val as number, 0)
        }
        this.outStream.write(buf)
    }

    /**
     * writes 4 unsigned bytes to the end of the packet's stream buffer
     * @param val the unsigned 4 bytes to write
     * @param littleEndian should the bytes be written in little endian?
     */
    public writeUInt32(val: number, littleEndian: boolean = true): void {
        const buf: Buffer = new Buffer(4)
        if (littleEndian) {
            buf.writeUInt32LE(val as number, 0)
        } else {
            buf.writeUInt32BE(val as number, 0)
        }
        this.outStream.write(buf)
    }

    /**
     * writes 8 unsigned bytes to the end of the packet's stream buffer
     * @param val the unsigned 8 bytes to write
     * @param littleEndian should the bytes be written in little endian?
     */
    public writeUInt64(val: Uint64LE | Uint64BE, littleEndian: boolean = true): void {
        let buf: Buffer = null
        if (littleEndian) {
            buf = (val as Uint64LE).toBuffer()
        } else {
            buf = (val as Uint64BE).toBuffer()
        }
        this.outStream.write(buf)
    }

    public writeLongString(str: PacketLongString): void {
        this.outStream.write(str.toBuffer())
    }

    public writeString(str: PacketString): void {
        this.outStream.write(str.toBuffer())
    }

    /**
     * build the packet's header
     */
    protected buildHeader(): void {
        this.writeUInt8(PacketSignature)
        this.writeUInt8(this.sequence)
        this.writeUInt16(0)
        this.writeUInt8(this.id)
    }
}
