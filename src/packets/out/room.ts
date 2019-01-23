import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { NewRoomSettings } from 'room/newroomsettings'
import { Room, RoomReadyStatus, RoomTeamNum } from 'room/room'
import { User } from 'user/user'

import { OutRoomCountdown } from 'packets/out/room/countdown'
import { OutRoomCreateAndJoin } from 'packets/out/room/createandjoin'
import { OutRoomGameResult } from 'packets/out/room/gameresult'
import { OutRoomPlayerJoin } from 'packets/out/room/playerjoin'
import { OutRoomPlayerLeave } from 'packets/out/room/playerleave'
import { OutRoomPlayerReady } from 'packets/out/room/playerready'
import { OutRoomSetHost } from 'packets/out/room/sethost'
import { OutRoomSetUserTeam } from 'packets/out/room/setuserteam'
import { OutRoomUpdateSettings } from 'packets/out/room/updatesettings'

import { ExtendedSocket } from 'extendedsocket'

enum OutRoomPacketType {
    CreateAndJoin = 0,
    PlayerJoin = 1,
    PlayerLeave = 2,
    SetPlayerReady = 3,
    UpdateSettings = 4,
    SetHost = 5,
    SetGameResult = 6,
    setUserTeam = 7,
    Countdown = 14,
}

/**
 * outgoing room information
 * @class OutRoomPacket
 */
export class OutRoomPacket extends OutPacketBase {
    constructor(socket: ExtendedSocket) {
        super(socket, PacketId.Room)
    }

    public createAndJoin(roomInfo: Room): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 200, incrementAmount: 20 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.CreateAndJoin)

        new OutRoomCreateAndJoin(roomInfo).build(this)

        return this.getData()
    }

    public playerJoin(user: User, teamNum: RoomTeamNum): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 60, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.PlayerJoin)

        new OutRoomPlayerJoin(user, teamNum).build(this)

        return this.getData()
    }

    public playerLeave(userId: number): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 20, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.PlayerLeave)

        new OutRoomPlayerLeave(userId).build(this)

        return this.getData()
    }

    public setUserReadyStatus(user: User, readyStatus: RoomReadyStatus): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 20, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.SetPlayerReady)

        new OutRoomPlayerReady(user.userId, readyStatus).build(this)

        return this.getData()
    }

    public updateSettings(newSettings: NewRoomSettings): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 30, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.UpdateSettings)

        new OutRoomUpdateSettings(newSettings).build(this)

        return this.getData()
    }

    public setHost(user: User): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 30, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.SetHost)

        new OutRoomSetHost(user.userId).build(this)

        return this.getData()
    }

    public setGameResult(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 30, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.SetGameResult)

        new OutRoomGameResult().build(this)

        return this.getData()
    }

    public progressCountdown(countdown: number): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 20, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.Countdown)

        new OutRoomCountdown(true, countdown).build(this)

        return this.getData()
    }

    public stopCountdown(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 20, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.Countdown)

        new OutRoomCountdown(false).build(this)

        return this.getData()
    }

    public setUserTeam(user: User, teamNum: number): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 20, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.setUserTeam)

        new OutRoomSetUserTeam(user, teamNum).build(this)

        return this.getData()
    }
}
