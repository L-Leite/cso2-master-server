import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { Room, RoomTeamNum } from 'room/room'
import { User } from 'user/user'

import { InRoomUpdateSettings } from 'packets/in/room/updatesettings'

import { OutRoomCountdown } from 'packets/out/room/countdown'
import { OutRoomCreateAndJoin } from 'packets/out/room/createandjoin'
import { OutRoomPlayerJoin } from 'packets/out/room/playerjoin'
import { OutRoomPlayerLeave } from 'packets/out/room/playerleave'
import { OutRoomSetHost } from 'packets/out/room/sethost'
import { OutRoomUpdateSettings } from 'packets/out/room/updatesettings'
import { OutRoomSetUserTeam } from './room/setuserteam'

enum OutRoomPacketType {
    CreateAndJoin = 0,
    PlayerJoin = 1,
    PlayerLeave = 2,
    UpdateSettings = 4,
    SetHost = 5,
    setUserTeam = 7,
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
        this.id = PacketId.Room
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

    public playerJoin(user: User, teamNum: RoomTeamNum): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 60, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.PlayerJoin)

        new OutRoomPlayerJoin(user, teamNum).build(this)

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

    public progressCountdown(countdown: number): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 20, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.Countdown)

        new OutRoomCountdown(true, countdown).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }

    public stopCountdown(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 20, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.Countdown)

        new OutRoomCountdown(false).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }

    public setUserTeam(user: User, teamNum: number): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 20, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.setUserTeam)

        new OutRoomSetUserTeam(user, teamNum).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }
}
