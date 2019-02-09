import { WritableStreamBuffer } from 'stream-buffers'

import { OutPacketBase } from 'packets/out/packet'

import { PacketId } from 'packets/definitions'
import { HostPacketType } from 'packets/hostshared'

import { User } from 'user/user'
import { UserInventoryItem } from 'user/userinventoryitem'

import { ExtendedSocket } from 'extendedsocket'

import { OutHostBuyMenu } from 'packets/out/host/buymenu'
import { OutHostGameStart } from 'packets/out/host/gamestart'
import { OutHostSetInventory } from 'packets/out/host/inventory'
import { OutHostJoinHost } from 'packets/out/host/joinhost'
import { OutHostLoadout } from 'packets/out/host/loadout'

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

    public setInventory(userId: number, items: UserInventoryItem[]): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 80, incrementAmount: 20 })

        this.buildHeader()
        this.writeUInt8(HostPacketType.SetInventory)

        new OutHostSetInventory(userId, items).build(this)

        return this.getData()
    }

    public setLoadout(user: User): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 80, incrementAmount: 20 })

        this.buildHeader()
        this.writeUInt8(HostPacketType.SetLoadout)

        new OutHostLoadout(user.userId, user.inventory.ctModelItem,
            user.inventory.terModelItem, user.inventory.headItem,
            user.inventory.gloveItem, user.inventory.backItem,
            user.inventory.stepsItem, user.inventory.cardItem,
            user.inventory.sprayItem, user.inventory.loadouts).build(this)

        return this.getData()
    }

    public setBuyMenu(user: User): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 80, incrementAmount: 20 })

        this.buildHeader()
        this.writeUInt8(HostPacketType.SetBuyMenu)

        new OutHostBuyMenu(user.userId, user.inventory.buymenu).build(this)

        return this.getData()
    }
}
