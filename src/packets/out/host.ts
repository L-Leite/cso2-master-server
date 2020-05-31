import { WritableStreamBuffer } from 'stream-buffers'

import { OutPacketBase } from 'packets/out/packet'

import { PacketId } from 'packets/definitions'
import { HostPacketType } from 'packets/definitions'

import { UserInventory } from 'user/userinventory'
import { UserInventoryItem } from 'user/userinventoryitem'

import { OutHostBuyMenu } from 'packets/out/host/buymenu'
import { OutHostGameStart } from 'packets/out/host/gamestart'
import { OutHostSetInventory } from 'packets/out/host/inventory'
import { OutHostItemUsing } from 'packets/out/host/itemusing'
import { OutHostJoinHost } from 'packets/out/host/joinhost'
import { OutHostLoadout } from 'packets/out/host/loadout'

/**
 * outgoing room host information
 * @class OutHostPacket
 */
export class OutHostPacket extends OutPacketBase {

    public static gameStart(hostUserId: number): OutHostPacket {
        const packet: OutHostPacket = new OutHostPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 12, incrementAmount: 4 })

        packet.buildHeader()
        packet.writeUInt8(HostPacketType.GameStart)

        OutHostGameStart.build(hostUserId, packet)

        return packet
    }

    public static joinHost(hostUserId: number): OutHostPacket {
        const packet: OutHostPacket = new OutHostPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 20, incrementAmount: 4 })

        packet.buildHeader()
        packet.writeUInt8(HostPacketType.HostJoin)

        OutHostJoinHost.build(hostUserId, packet)

        return packet
    }

    public static hostStop(): OutHostPacket {
        const packet: OutHostPacket = new OutHostPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 8, incrementAmount: 4 })

        packet.buildHeader()
        packet.writeUInt8(HostPacketType.HostStop)

        return packet
    }

    public static leaveResultWindow(): OutHostPacket {
        const packet: OutHostPacket = new OutHostPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 8, incrementAmount: 4 })

        packet.buildHeader()
        packet.writeUInt8(HostPacketType.LeaveResultWindow)

        return packet
    }

    public static itemUse(userId: number, itemId: number): OutHostPacket {
        const packet: OutHostPacket = new OutHostPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 80, incrementAmount: 20 })

        packet.buildHeader()
        packet.writeUInt8(HostPacketType.ItemUsing)

        OutHostItemUsing.build(userId, itemId, packet)

        return packet
    }

    public static setInventory(userId: number, items: UserInventoryItem[]): OutHostPacket {
        const packet: OutHostPacket = new OutHostPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 80, incrementAmount: 20 })

        packet.buildHeader()
        packet.writeUInt8(HostPacketType.SetInventory)

        OutHostSetInventory.build(userId, items, packet)

        return packet
    }

    public static async setLoadout(userId: number): Promise<OutHostPacket> {
        const packet: OutHostPacket = new OutHostPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 80, incrementAmount: 20 })

        packet.buildHeader()
        packet.writeUInt8(HostPacketType.SetLoadout)

        const cosmeticsPromise = UserInventory.getCosmetics(userId)
        const loadoutsPromise = UserInventory.getAllLoadouts(userId)
        const results = await Promise.all([cosmeticsPromise, loadoutsPromise])

        OutHostLoadout.build(userId, results[0], results[1], packet)

        return packet
    }

    public static async setBuyMenu(userId: number): Promise<OutHostPacket> {
        const packet: OutHostPacket = new OutHostPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 80, incrementAmount: 20 })

        packet.buildHeader()
        packet.writeUInt8(HostPacketType.SetBuyMenu)

        OutHostBuyMenu.build(userId, await UserInventory.getBuyMenu(userId), packet)

        return packet
    }
    constructor() {
        super(PacketId.Host)
    }
}
