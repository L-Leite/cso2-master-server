import { Int64BE, Int64LE, Uint64BE, Uint64LE } from 'int64-buffer'

import { PacketBaseShared } from 'packets/packetbaseshared'

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
export class InPacketBase extends PacketBaseShared {
    // the received packet's data
    protected packetData: Buffer
    // the current offset to the buffer packetData
    private curOffset: number
    // was the packet processed sucessfully?
    private parsedSuccessfully: boolean

    constructor(data: Buffer) {
        super()
        this.packetData = data
        this.curOffset = 0

        try {
            this.parse()
            this.parsedSuccessfully = true
        } catch (error) {
            console.warn('Error parsing packet: %s', error)
            this.parsedSuccessfully = false
        }
    }

    /**
     * @returns the packet's data
     */
    public getData(): Buffer {
        return this.packetData
    }

    /**
     * was the packet parsed succesfully?
     * @returns true if so, false if not
     */
    public isParsed(): boolean {
        return this.parsedSuccessfully
    }

    /**
     * reads a byte from the current offset
     * @returns the read signed byte
     */
    public readInt8(): number {
        if (this.canReadBytes(1) === false) {
            throw new Error('Data buffer is too small')
        }
        return this.packetData.readInt8(this.curOffset++)
    }

    /**
     * reads two bytes from the current offset
     * @returns the read signed bytes
     */
    public readInt16(bigEndian = false): number {
        if (this.canReadBytes(2) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: number = bigEndian
            ? this.packetData.readInt16BE(this.curOffset)
            : this.packetData.readInt16LE(this.curOffset)
        this.curOffset += 2
        return res
    }

    /**
     * reads four bytes from the current offset
     * @returns the read signed bytes
     */
    public readInt32(bigEndian = false): number {
        if (this.canReadBytes(4) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: number = bigEndian
            ? this.packetData.readInt32BE(this.curOffset)
            : this.packetData.readInt32LE(this.curOffset)
        this.curOffset += 4
        return res
    }

    /**
     * reads eight bytes from the current offset
     * @returns the read signed bytes
     */
    public readInt64(bigEndian = false): Int64LE | Int64BE {
        if (this.canReadBytes(8) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: Int64LE | Int64BE = bigEndian
            ? new Int64BE(this.packetData, this.curOffset)
            : new Int64LE(this.packetData, this.curOffset)
        this.curOffset += 8
        return res
    }

    /**
     * reads a byte from the current offset
     * @returns the read unsigned byte
     */
    public readUInt8(): number {
        if (this.canReadBytes(1) === false) {
            throw new Error('Data buffer is too small')
        }
        return this.packetData.readUInt8(this.curOffset++)
    }

    /**
     * reads two bytes from the current offset
     * @returns the read unsigned bytes
     */
    public readUInt16(bigEndian = false): number {
        if (this.canReadBytes(2) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: number = bigEndian
            ? this.packetData.readUInt16BE(this.curOffset)
            : this.packetData.readUInt16LE(this.curOffset)
        this.curOffset += 2
        return res
    }

    /**
     * reads four bytes from the current offset
     * @returns the read unsigned bytes
     */
    public readUInt32(bigEndian = false): number {
        if (this.canReadBytes(4) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: number = bigEndian
            ? this.packetData.readUInt32BE(this.curOffset)
            : this.packetData.readUInt32LE(this.curOffset)
        this.curOffset += 4
        return res
    }

    /**
     * reads eight bytes from the current offset
     * @returns the read unsigned bytes
     */
    public readUInt64(bigEndian = false): Uint64LE | Uint64BE {
        if (this.canReadBytes(8) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: Uint64LE | Uint64BE = bigEndian
            ? new Uint64BE(this.packetData, this.curOffset)
            : new Uint64LE(this.packetData, this.curOffset)
        this.curOffset += 8
        return res
    }

    /**
     * reads four bytes from the current offset as a floating point value
     * @returns the read unsigned bytes
     */
    public readFloat(bigEndian = false): number {
        if (this.canReadBytes(4) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: number = bigEndian
            ? this.packetData.readFloatBE(this.curOffset)
            : this.packetData.readFloatLE(this.curOffset)
        this.curOffset += 4
        return res
    }

    /**
     * reads eight bytes from the current offset as a floating point value
     * @returns the read unsigned bytes
     */
    public readDouble(bigEndian = false): number {
        if (this.canReadBytes(8) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: number = bigEndian
            ? this.packetData.readDoubleBE(this.curOffset)
            : this.packetData.readDoubleLE(this.curOffset)
        this.curOffset += 8
        return res
    }

    /**
     * reads a string from the current offset
     * * the string's size is 1 byte long
     * @returns the read bytes
     */
    public readString(): string {
        if (this.canReadBytes(1) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: PacketString = PacketString.from(
            this.packetData.slice(this.curOffset, this.packetData.length)
        )
        this.curOffset += res.totalLen
        return res.str
    }

    /**
     * reads an string from the current offset
     * the string's size is 2 byte long
     * @returns the read bytes
     */
    public readLongString(): string {
        if (this.canReadBytes(2) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: PacketLongString = PacketLongString.from(
            this.packetData.slice(this.curOffset, this.packetData.length)
        )
        this.curOffset += res.totalLen
        return res.str
    }

    /**
     * reads the length from current offset
     * @param length - the size of the data to read in bytes
     * @returns a buffer with length's size
     */
    public readArray(length: number): Buffer {
        if (this.canReadBytes(length) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: Buffer = this.packetData.slice(
            this.curOffset,
            this.curOffset + length
        )
        this.curOffset += length
        return res
    }

    /**
     * parses the packet's data
     */
    protected parse(): void {
        this.signature = this.readUInt8()

        if (this.isValid() === false) {
            throw new Error(
                `This is not a packet. Signature: ${this.signature}`
            )
        }

        this.sequence = this.readUInt8()
        this.length = this.readUInt16()
        this.id = this.readUInt8()
    }

    private canReadBytes(bytes: number): boolean {
        return this.packetData.byteLength >= this.curOffset + bytes
    }
}
