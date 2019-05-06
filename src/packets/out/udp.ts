import ip from 'ip'
import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

/**
 * outgoing udp holepunch information packet
 * used to connect users to each other in a match
 * Structure:
 * [base packet]
 * [unk00 - 1 byte]
 * [isHost - 1 byte]
 * [userId - 4 bytes]
 * [ip - 4 bytes in big endian]
 * [port - 2 bytes]
 * @class OutUdpPacket
 */
export class OutUdpPacket extends OutPacketBase {
    constructor(isHost: boolean, userId: number,
                ipAddress: string, port: number) {
        super(PacketId.Udp)
        this.outStream = new WritableStreamBuffer(
            { initialSize: 32, incrementAmount: 8 })

        this.buildHeader()

        this.writeUInt8(1) // unk00
        this.writeUInt8(isHost ? 1 : 0)
        this.writeUInt32(userId)
        this.writeUInt32(ip.toLong(ipAddress), false)
        this.writeUInt16(port)
    }
}
