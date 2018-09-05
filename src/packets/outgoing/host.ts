import { WritableStreamBuffer } from 'stream-buffers';

import { ValToBuffer } from '../../util';

import { PacketId } from '../definitions'
import { HostGameStart } from './host/gamestart';
import { HostJoinHost } from './host/joinhost';
import { OutgoingPacket } from './packet'

export enum HostPacketType {
    GameStart = 0, // the host starts a new game
    HostJoin, // joins a host's match
}

export class OutgoingHostPacket extends OutgoingPacket {
    private type: number
    constructor(seq: number) {
        super()
        this.sequence = seq
        this.id = PacketId.Host
    }

    public gameStart(hostUserId: number): Buffer {
        const outStream: WritableStreamBuffer = new WritableStreamBuffer(
            { initialSize: 10, incrementAmount: 4 })

        this.type = HostPacketType.GameStart

        // packet size excludes packet header
        this.buildHeader(outStream)

        // packet id
        outStream.write(ValToBuffer(this.id, 1))

        outStream.write(ValToBuffer(this.type, 1))

        const gameStart = new HostGameStart(hostUserId)
        gameStart.build(outStream)

        const resBuffer: Buffer = outStream.getContents()
        this.setPacketLength(resBuffer)

        return resBuffer
    }

    public joinHost(hostUserId: number): Buffer {
        const outStream: WritableStreamBuffer = new WritableStreamBuffer(
            { initialSize: 10, incrementAmount: 4 })

        this.type = HostPacketType.HostJoin

        // packet size excludes packet header
        this.buildHeader(outStream)

        // packet id
        outStream.write(ValToBuffer(this.id, 1))

        outStream.write(ValToBuffer(this.type, 1))

        const joinHost = new HostJoinHost(hostUserId)
        joinHost.build(outStream)

        const resBuffer: Buffer = outStream.getContents()
        this.setPacketLength(resBuffer)

        return resBuffer
    }
}
