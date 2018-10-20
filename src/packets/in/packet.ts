import { Int64BE, Int64LE, Uint64BE, Uint64LE } from 'int64-buffer'

import { PacketId, PacketSignature } from 'packets/definitions'
import { PacketLongString } from 'packets/packetlongstring'
import { PacketString } from 'packets/packetstring'

/**
 * The incoming TCP packet's base
 * Structure:
 * [signature - 1 byte]
 * [sequence - 1 byte]
 * [length - 2 bytes]
 * [packetId - 1 byte] - this is technically not part
 *                 of the base packet
 * @class InPacketBase
 */
export class InPacketBase {
    // start of the packet structure
    public signature: number
    public sequence: number
    public length: number
    public id: PacketId
    // end of the packet structure
    protected packetData: Buffer
    // the current offset to the buffer
    private curOffset: number

    constructor(data: Buffer) {
        this.packetData = data
        this.curOffset = 0
        this.parse()
    }

    /**
     * is the packet signature good?
     * @returns true if yes, otherwise false
     */
    public isValid(): boolean {
        return this.signature === PacketSignature
    }

    /**
     * parses the packet's data
     */
    protected parse(): void {
        this.signature = this.readUInt8()

        if (this.isValid() === false) {
            throw new Error('This is not a packet')
        }

        this.sequence = this.readUInt8()
        this.length = this.readUInt16()
        this.id = this.readUInt8()
    }

    /**
     * reads a byte from the current offset
     * @returns the read signed byte
     */
    protected readInt8(): number {
        if (this.canReadBytes(1) === false) {
            throw new Error('Data buffer is too small')
        }
        return this.packetData.readInt8(this.curOffset++)
    }

    /**
     * reads two bytes from the current offset
     * @returns the read signed bytes
     */
    protected readInt16(bigEndian: boolean = false): number {
        if (this.canReadBytes(2) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: number = bigEndian ?
            this.packetData.readInt16BE(this.curOffset) :
            this.packetData.readInt16LE(this.curOffset)
        this.curOffset += 2
        return res
    }

    /**
     * reads four bytes from the current offset
     * @returns the read signed bytes
     */
    protected readInt32(bigEndian: boolean = false): number {
        if (this.canReadBytes(4) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: number = bigEndian ?
            this.packetData.readInt32BE(this.curOffset) :
            this.packetData.readInt32LE(this.curOffset)
        this.curOffset += 4
        return res
    }

    /**
     * reads eight bytes from the current offset
     * @returns the read signed bytes
     */
    protected readInt64(bigEndian: boolean = false): Int64LE | Int64BE {
        if (this.canReadBytes(8) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: Int64LE | Int64BE = bigEndian ?
            new Int64BE(this.packetData, this.curOffset) :
            new Int64LE(this.packetData, this.curOffset)
        this.curOffset += 8
        return res
    }

    /**
     * reads a byte from the current offset
     * @returns the read unsigned byte
     */
    protected readUInt8(): number {
        if (this.canReadBytes(1) === false) {
            throw new Error('Data buffer is too small')
        }
        return this.packetData.readUInt8(this.curOffset++)
    }

    /**
     * reads two bytes from the current offset
     * @returns the read unsigned bytes
     */
    protected readUInt16(bigEndian: boolean = false): number {
        if (this.canReadBytes(2) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: number = bigEndian ?
            this.packetData.readUInt16BE(this.curOffset) :
            this.packetData.readUInt16LE(this.curOffset)
        this.curOffset += 2
        return res
    }

    /**
     * reads four bytes from the current offset
     * @returns the read unsigned bytes
     */
    protected readUInt32(bigEndian: boolean = false): number {
        if (this.canReadBytes(4) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: number = bigEndian ?
            this.packetData.readUInt32BE(this.curOffset) :
            this.packetData.readUInt32LE(this.curOffset)
        this.curOffset += 4
        return res
    }

    /**
     * reads eight bytes from the current offset
     * @returns the read unsigned bytes
     */
    protected readUInt64(bigEndian: boolean = false): Uint64LE | Uint64BE {
        if (this.canReadBytes(8) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: Uint64LE | Uint64BE = bigEndian ?
            new Uint64BE(this.packetData, this.curOffset) :
            new Uint64LE(this.packetData, this.curOffset)
        this.curOffset += 8
        return res
    }

    /**
     * reads an ascii string from the current offset
     * @returns the read bytes
     */
    protected readString(): string {
        // let's make sure that the size is present
        if (this.canReadBytes(1) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: PacketString = PacketString.from(
            this.packetData.slice(this.curOffset,
                this.packetData.length))
        this.curOffset += res.rawLength()
        return res.str
    }

    /**
     * reads an utf8 string from the current offset
     * @returns the read bytes
     */
    protected readUtf8String(): string {
        // let's make sure that the size is present
        if (this.canReadBytes(2) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: PacketLongString = PacketLongString.from(
            this.packetData.slice(this.curOffset,
                this.packetData.length))
        this.curOffset += res.rawLength()
        return res.str
    }

    /**
     * reads the length from current offset
     * @param length - the size of the data to read in bytes
     * @returns a buffer with length's size
     */
    protected readArray(length: number): Buffer {
        if (this.canReadBytes(length) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: Buffer = this.packetData.slice(this.curOffset,
            this.curOffset + length)
        this.curOffset += length
        return res
    }

    private canReadBytes(bytes: number): boolean {
        return this.packetData.byteLength >= this.curOffset + bytes
    }
}
