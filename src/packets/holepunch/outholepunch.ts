import { UdpPacketSignature } from 'packets/holepunchbaseshared'

/**
 * sends out an acknowledgement holepunch packet to the user
 */
export class OutHolepunchPacketUdp {
    private portId: number

    constructor(portId: number) {
        this.portId = portId
    }

    // returns parsed size of packet
    public build(): Buffer {
        // the packet is always 3 bytes long
        const outBuffer: Buffer = Buffer.alloc(3)

        outBuffer.writeUInt8(UdpPacketSignature, 0)
        outBuffer.writeUInt16LE(this.portId, 1)

        return outBuffer
    }
}
