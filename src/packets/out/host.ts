import { WritableStreamBuffer } from 'stream-buffers'

import { OutPacketBase } from 'packets/out/packet'

import { PacketId } from 'packets/definitions'
import { HostPacketType } from 'packets/hostshared'

import { OutHostGameStart } from 'packets/out/host/gamestart'
import { OutHostJoinHost } from 'packets/out/host/joinhost'
import { OutHostPreloadInventory } from 'packets/out/host/preloadinventory'

import { User } from 'user/user'

import { ExtendedSocket } from 'extendedsocket'

/**
 * outgoing room host information
 * @class OutHostPacket
 */
export class OutHostPacket extends OutPacketBase {
    constructor(socket: ExtendedSocket) {
        super(socket, PacketId.Host)
    }

    public gameStart(host: User): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 12, incrementAmount: 4 })

        this.buildHeader()
        this.writeUInt8(HostPacketType.GameStart)

        new OutHostGameStart(host.userId).build(this)

        return this.getData()
    }

    public joinHost(host: User): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 20, incrementAmount: 4 })

        this.buildHeader()
        this.writeUInt8(HostPacketType.HostJoin)

        new OutHostJoinHost(host.userId).build(this)

        return this.getData()
    }

    public hostStop(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 8, incrementAmount: 4 })

        this.buildHeader()
        this.writeUInt8(HostPacketType.HostStop)

        return this.getData()
    }

    public leaveResultWindow(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 8, incrementAmount: 4 })

        this.buildHeader()
        this.writeUInt8(HostPacketType.LeaveResultWindow)

        return this.getData()
    }

    public preloadInventory(entityNum: number): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 80, incrementAmount: 20 })

        this.buildHeader()
        this.writeUInt8(HostPacketType.PreloadInventory)

        new OutHostPreloadInventory(entityNum).build(this)

        return this.getData()
    }
}
