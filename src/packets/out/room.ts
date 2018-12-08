import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { Room } from 'room/room'
import { User } from 'user/user'

import { InRoomUpdateSettings } from 'packets/in/room/updatesettings'

import { OutRoomCountdown } from 'packets/out/room/countdown'
import { OutRoomCreateAndJoin } from 'packets/out/room/createandjoin'
import { OutRoomPlayerJoin } from 'packets/out/room/playerjoin'
import { OutRoomPlayerLeave } from 'packets/out/room/playerleave'
import { OutRoomSetHost } from 'packets/out/room/sethost'
import { OutRoomSwapTeam } from 'packets/out/room/swapteam'
import { OutRoomUpdateSettings } from 'packets/out/room/updatesettings'

enum OutRoomPacketType {
    CreateAndJoin = 0,
    PlayerJoin = 1, // a new player enters out current room
    PlayerLeave = 2,
    UpdateSettings = 4,
    SetHost = 5,
    SwapTeam = 9,
    Countdown = 14,
}

/**
 * outgoing room information
 * @class OutRoomPacket
 */
export class OutRoomPacket extends OutPacketBase {

    constructor(seq: number) {
        super()
        this.sequence = seq
        this.packetId = PacketId.Room
    }

    public createAndJoin(roomInfo: Room): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 100, incrementAmount: 20 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.CreateAndJoin)

        new OutRoomCreateAndJoin(roomInfo).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }

    public playerJoin(user: User): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 60, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.PlayerJoin)

        new OutRoomPlayerJoin(user).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }

    public playerLeave(userId: number): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 20, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.PlayerLeave)

        new OutRoomPlayerLeave(userId).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }

    public updateSettings(newSettings: InRoomUpdateSettings): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 30, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.UpdateSettings)

        new OutRoomUpdateSettings(newSettings).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }

    public setHost(user: User): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 30, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.SetHost)

        new OutRoomSetHost(user.userId).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }

    public countdown(countdown: number): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 20, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.Countdown)

        new OutRoomCountdown(countdown).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }

    public swapTeam(newTeam: number): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 20, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.SwapTeam)

        new OutRoomSwapTeam(newTeam).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }
}
