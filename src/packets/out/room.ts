import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { Room } from 'room/room'
import { User } from 'user/user'

import { InRoomUpdateSettings } from 'packets/in/room/updatesettings'
import { OutRoomCountdown } from 'packets/out/room/countdown'
import { OutRoomCreateAndJoinRoom } from 'packets/out/room/createandjoin'
import { OutRoomNewPlayerJoin } from 'packets/out/room/newplayerjoin'
import { OutRoomSwapTeam } from 'packets/out/room/swapteam'
import { OutRoomUpdateSettings } from 'packets/out/room/updatesettings'

enum OutRoomPacketType {
    CreateAndJoinRoom = 0,
    NewPlayerJoinRoom = 1, // a new player enters out current room
    UpdateSettings = 4,
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

    public createAndJoinRoom(roomInfo: Room): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 100, incrementAmount: 20 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.CreateAndJoinRoom)

        new OutRoomCreateAndJoinRoom(roomInfo).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }

    public newPlayerJoinRoom(user: User): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 60, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.NewPlayerJoinRoom)

        new OutRoomNewPlayerJoin(user).build(this)

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
