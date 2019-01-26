import ip from 'ip'

import { UdpPacketSignature } from 'packets/holepunchbaseshared'

export enum HolepunchType {
    Client = 0,
    Server = 256,
    SourceTV = 512,
}

/**
 * an user's holepunch data
 * look up UDP hole punching for more info
 * the data here will be used to connect users with each other in a match
 */
export class InHolepunchPacketUdp {
    public signature: number
    public userId: number
    public portId: number
    public ipAddress: string
    public port: number

    private packetData: Buffer
    private curOffset: number
    private parsedSuccessfully: boolean

    constructor(data: Buffer) {
        this.packetData = data
        this.curOffset = 0

        try {
            this.parse()
            this.parsedSuccessfully = true
        } catch (error) {
            console.warn('Error parsing holepunch packet. %s', error)
            this.parsedSuccessfully = false
        }
    }

    /**
     * was the packet parsed succesfully?
     * @returns true if so, false if not
     */
    public isParsed(): boolean {
        return this.parsedSuccessfully
    }

    public isHeartbeat(): boolean {
        return this.packetData.byteLength === 6
    }

    // returns parsed size of packet
    private parse(): void {
        this.signature = this.packetData.readUInt8(this.curOffset++)

        if (this.signature !== UdpPacketSignature) {
            throw new Error('this is not a holepucnh packet!')
        }

        if (this.isHeartbeat()) {
            // this.userId = this.packetData.readUInt32LE(curOffset)
            // curOffset += 4

            // keep alive packet, to be reversed?
        } else {
            this.userId = this.readUInt32()
            this.portId = this.readUInt16()

            // cso2 does a bitwise not operation on the ip. maybe find out why?
            /* tslint:disable-next-line:no-bitwise */
            const fixedIp: number = ~this.readUInt32(true)
            this.ipAddress = ip.fromLong(fixedIp)

            this.port = this.readUInt16()
        }
    }

    /**
     * reads two bytes from the current offset
     * @returns the read unsigned bytes
     */
    private readUInt16(bigEndian: boolean = false): number {
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
    private readUInt32(bigEndian: boolean = false): number {
        if (this.canReadBytes(4) === false) {
            throw new Error('Data buffer is too small')
        }
        const res: number = bigEndian ?
            this.packetData.readUInt32BE(this.curOffset) :
            this.packetData.readUInt32LE(this.curOffset)
        this.curOffset += 4
        return res
    }

    private canReadBytes(bytes: number): boolean {
        return this.packetData.byteLength >= this.curOffset + bytes
    }
}
