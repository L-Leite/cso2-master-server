import { Int64BE, Int64LE, Uint64BE, Uint64LE } from 'int64-buffer'
import { WritableStreamBuffer } from 'stream-buffers'

import { PacketSignature } from '../definitions'
import { PacketString } from '../packetstring'
import { PacketUtf8String } from '../packetutf8string'

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
export abstract class OutPacketBase {

    /**
     * once we are done inserting data, calculate the packet size
     * and write it to the packet header
     */
    protected static setPacketLength(packet: Buffer) {
        packet.writeUInt16LE(packet.byteLength - 4, 2)
    }
    protected sequence: number
    protected packetId: number
    protected outStream: WritableStreamBuffer

    /**
     * builds the packet with data provided by us
     */
    // public abstract build(): Buffer

    /**
     * writes a signed byte to the end of the packet's stream buffer
     * @param val the signed byte to write
     */
    public writeInt8(val: number): void {
        this.outStream.write(
            this.SignedToBuffer(val, 1))
    }

    /**
     * writes 2 signed bytes to the end of the packet's stream buffer
     * @param val the signed 2 bytes to write
     * @param littleEndian should the bytes be written in little endian?
     */
    public writeInt16(val: number, littleEndian: boolean = true): void {
        this.outStream.write(
            this.SignedToBuffer(val, 2, littleEndian))
    }

    /**
     * writes 4 signed bytes to the end of the packet's stream buffer
     * @param val the signed 4 bytes to write
     * @param littleEndian should the bytes be written in little endian?
     */
    public writeInt32(val: number, littleEndian: boolean = true): void {
        this.outStream.write(
            this.SignedToBuffer(val, 4, littleEndian))
    }

    /**
     * writes 8 signed bytes to the end of the packet's stream buffer
     * @param val the signed 8 bytes to write
     * @param littleEndian should the bytes be written in little endian?
     */
    public writeInt64(val: Int64LE | Int64BE, littleEndian: boolean = true): void {
        this.outStream.write(
            this.SignedToBuffer(val, 8, littleEndian))
    }

    /**
     * writes an unsigned byte to the end of the packet's stream buffer
     * @param val the unsigned byte to write
     */
    public writeUInt8(val: number): void {
        this.outStream.write(
            this.UnsignedToBuffer(val, 1))
    }

    /**
     * writes 2 unsigned bytes to the end of the packet's stream buffer
     * @param val the unsigned 2 bytes to write
     * @param littleEndian should the bytes be written in little endian?
     */
    public writeUInt16(val: number, littleEndian: boolean = true): void {
        this.outStream.write(
            this.UnsignedToBuffer(val, 2, littleEndian))
    }

    /**
     * writes 4 unsigned bytes to the end of the packet's stream buffer
     * @param val the unsigned 4 bytes to write
     * @param littleEndian should the bytes be written in little endian?
     */
    public writeUInt32(val: number, littleEndian: boolean = true): void {
        this.outStream.write(
            this.UnsignedToBuffer(val, 4, littleEndian))
    }

    /**
     * writes 8 unsigned bytes to the end of the packet's stream buffer
     * @param val the unsigned 8 bytes to write
     * @param littleEndian should the bytes be written in little endian?
     */
    public writeUInt64(val: Uint64LE | Uint64BE, littleEndian: boolean = true): void {
        this.outStream.write(
            this.UnsignedToBuffer(val, 8, littleEndian))
    }

    public writeUtf8String(str: PacketUtf8String): void {
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
        this.writeUInt8(this.packetId)
    }

    /**
     * converts a signed number to a buffer of a respective length
     * @param val the number value to convert
     * @param length the length of the number in bytes
     * @param littleEndian should the number be written in little endian
     */
    private SignedToBuffer(
        val: number | Int64LE | Int64BE,
        length: number, littleEndian: boolean = true): Buffer {
        const buf: Buffer = new Buffer(length)
        switch (length) {
            case 1:
                buf.writeInt8(val as number, 0)
                break
            case 2:
                if (littleEndian) {
                    buf.writeInt16LE(val as number, 0)
                } else {
                    buf.writeInt16BE(val as number, 0)
                }
                break
            case 4:
                if (littleEndian) {
                    buf.writeInt32LE(val as number, 0)
                } else {
                    buf.writeInt32BE(val as number, 0)
                }
                break
            case 8:
                if (littleEndian) {
                    return (val as Int64LE).toBuffer()
                } else {
                    return (val as Int64BE).toBuffer()
                }
            default:
                throw new Error('Unknown value length used!')
        }
        return buf
    }

    /**
     * converts an unsigned number to a buffer of a respective length
     * @param val the number value to convert
     * @param length the length of the number in bytes
     * @param littleEndian should the number be written in little endian
     */
    private UnsignedToBuffer(
        val: number | Uint64LE | Uint64BE,
        length: number, littleEndian: boolean = true): Buffer {
        const buf: Buffer = new Buffer(length)
        switch (length) {
            case 1:
                buf.writeUInt8(val as number, 0)
                break
            case 2:
                if (littleEndian) {
                    buf.writeUInt16LE(val as number, 0)
                } else {
                    buf.writeUInt16BE(val as number, 0)
                }
                break
            case 4:
                if (littleEndian) {
                    buf.writeUInt32LE(val as number, 0)
                } else {
                    buf.writeUInt32BE(val as number, 0)
                }
                break
            case 8:
                if (littleEndian) {
                    return (val as Uint64LE).toBuffer()
                } else {
                    return (val as Uint64BE).toBuffer()
                }
            default:
                throw new Error('Unknown value length used!')
        }
        return buf
    }
}
