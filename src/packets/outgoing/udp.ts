import * as ip from 'ip'
import { WritableStreamBuffer } from 'stream-buffers';

import { ValToBuffer } from '../../util';

import { PacketId } from '../definitions'
import { OutgoingPacket } from './packet'

export class OutgoingUdpPacket extends OutgoingPacket {
    private unk00: number
    private isHost: number
    private userId: number
    private ip: number
    private port: number
    constructor(isHost: number, userId: number, ipAddress: string, port: number, seq: number) {
        super()
        this.sequence = seq
        this.id = PacketId.Udp

        this.unk00 = 1
        this.isHost = isHost
        this.userId = userId
        this.ip = ip.toLong(ipAddress)
        this.port = port
    }

    public build(): Buffer {
        const outStream: WritableStreamBuffer = new WritableStreamBuffer(
            { initialSize: 16, incrementAmount: 4 })

        // packet size excludes packet header
        this.buildHeader(outStream)

        // packet id
        outStream.write(ValToBuffer(this.id, 1))

        outStream.write(ValToBuffer(this.unk00, 1))

        outStream.write(ValToBuffer(this.isHost, 1))

        outStream.write(ValToBuffer(this.userId, 4))

        outStream.write(ValToBuffer(this.ip, 2))

        outStream.write(ValToBuffer(this.port, 2))

        const resBuffer: Buffer = outStream.getContents()
        this.setPacketLength(resBuffer)

        return resBuffer
    }
}
