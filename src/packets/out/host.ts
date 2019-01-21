import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { HostPacketType } from 'packets/in/host'
import { OutHostGameStart } from 'packets/out/host/gamestart'
import { OutHostJoinHost } from 'packets/out/host/joinhost'
import { OutHostPreloadInventory } from 'packets/out/host/preloadinventory'
import { OutPacketBase } from 'packets/out/packet'

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

        const gameStart = new OutHostGameStart(hostUserId)
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

        new OutHostJoinHost(hostUserId).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }

    public hostStop(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 12, incrementAmount: 4 })

        this.buildHeader()
        this.writeUInt8(HostPacketType.HostStop)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }

    public leaveResultWindow(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 12, incrementAmount: 4 })

        this.buildHeader()
        this.writeUInt8(HostPacketType.LeaveResultWindow)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }

    public preloadInventory(entityNum: number): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 50, incrementAmount: 20 })

        this.buildHeader()
        this.writeUInt8(HostPacketType.PreloadInventory)

        new OutHostPreloadInventory(entityNum).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }
}
