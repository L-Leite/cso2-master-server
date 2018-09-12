import * as ip from 'ip'
import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from '../definitions'
import { OutPacketBase } from './packet'

/**
 * outgoing udp information packet (this is not an UDP packet)
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
    private unk00: number
    private isHost: number
    private userId: number
    private ip: number
    private port: number
    constructor(isHost: number, userId: number, ipAddress: string, port: number, seq: number) {
        super()
        this.sequence = seq
        this.packetId = PacketId.Udp

        this.unk00 = 1
        this.isHost = isHost
        this.userId = userId
        this.ip = ip.toLong(ipAddress)
        this.port = port
    }

    public build(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 16, incrementAmount: 4 })

        this.buildHeader()

        this.writeUInt8(this.unk00)
        this.writeUInt8(this.isHost)
        this.writeUInt32(this.userId)
        this.writeUInt32(this.ip, false)
        this.writeUInt16(this.port)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }
}
