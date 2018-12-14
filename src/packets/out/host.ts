import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { HostGameStart } from 'packets/out/host/gamestart'
import { HostJoinHost } from 'packets/out/host/joinhost'
import { OutPacketBase } from 'packets/out/packet'

export enum HostPacketType {
    GameStart = 0, // when a host starts a new game
    HostJoin = 1, // when someone joins some host's game
}

/**
 * outgoing room host information
 * @class OutHostPacket
 */
export class OutHostPacket extends OutPacketBase {
    constructor(seq: number) {
        super()
        this.sequence = seq
        this.id = PacketId.Host
    }

    public gameStart(hostUserId: number): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 12, incrementAmount: 4 })

        this.buildHeader()
        this.writeUInt8(HostPacketType.GameStart)

        const gameStart = new HostGameStart(hostUserId)
        gameStart.build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }

    public joinHost(hostUserId: number): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 12, incrementAmount: 4 })

        this.buildHeader()
        this.writeUInt8(HostPacketType.HostJoin)

        new HostJoinHost(hostUserId).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }
}
