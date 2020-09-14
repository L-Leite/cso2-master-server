import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { Room, RoomReadyStatus } from 'room/room'

import { OutRoomCountdown } from 'packets/out/room/countdown'
import { OutRoomCreateAndJoin } from 'packets/out/room/createandjoin'
import { OutRoomGameResult } from 'packets/out/room/gameresult'
import { OutRoomPlayerJoin } from 'packets/out/room/playerjoin'
import { OutRoomPlayerLeave } from 'packets/out/room/playerleave'
import { OutRoomPlayerReady } from 'packets/out/room/playerready'
import { OutRoomSetHost } from 'packets/out/room/sethost'
import { OutRoomSetUserTeam } from 'packets/out/room/setuserteam'
import { OutRoomUpdateSettings } from 'packets/out/room/updatesettings'

import { RoomSettings } from 'room/roomsettings'

import { RoomUserEntry } from 'room/roomuserentry'
import { CSTeamNum } from 'gametypes/shareddefs'

enum OutRoomPacketType {
    CreateAndJoin = 0,
    PlayerJoin = 1,
    PlayerLeave = 2,
    SetPlayerReady = 3,
    UpdateSettings = 4,
    SetHost = 5,
    SetGameResult = 6,
    setUserTeam = 7,
    Countdown = 14
}

/**
 * outgoing room information
 * @class OutRoomPacket
 */
export class OutRoomPacket extends OutPacketBase {
    public static createAndJoin(room: Room): OutRoomPacket {
        const packet: OutRoomPacket = new OutRoomPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 200,
            incrementAmount: 20
        })

        packet.buildHeader()
        packet.writeUInt8(OutRoomPacketType.CreateAndJoin)

        OutRoomCreateAndJoin.build(room, packet)

        return packet
    }

    public static playerJoin(
        user: RoomUserEntry,
        teamNum: CSTeamNum
    ): OutRoomPacket {
        const packet: OutRoomPacket = new OutRoomPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 60,
            incrementAmount: 15
        })

        packet.buildHeader()
        packet.writeUInt8(OutRoomPacketType.PlayerJoin)

        OutRoomPlayerJoin.build(user.conn, teamNum, packet)

        return packet
    }

    public static playerLeave(userId: number): OutRoomPacket {
        const packet: OutRoomPacket = new OutRoomPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 20,
            incrementAmount: 15
        })

        packet.buildHeader()
        packet.writeUInt8(OutRoomPacketType.PlayerLeave)

        OutRoomPlayerLeave.build(userId, packet)

        return packet
    }

    public static setUserReadyStatus(
        userId: number,
        readyStatus: RoomReadyStatus
    ): OutRoomPacket {
        const packet: OutRoomPacket = new OutRoomPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 20,
            incrementAmount: 15
        })

        packet.buildHeader()
        packet.writeUInt8(OutRoomPacketType.SetPlayerReady)

        OutRoomPlayerReady.build(userId, readyStatus, packet)

        return packet
    }

    public static updateSettings(newSettings: RoomSettings): OutRoomPacket {
        const packet: OutRoomPacket = new OutRoomPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 30,
            incrementAmount: 15
        })

        packet.buildHeader()
        packet.writeUInt8(OutRoomPacketType.UpdateSettings)

        OutRoomUpdateSettings.build(newSettings, packet)

        return packet
    }

    public static setHost(userId: number): OutRoomPacket {
        const packet: OutRoomPacket = new OutRoomPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 30,
            incrementAmount: 15
        })

        packet.buildHeader()
        packet.writeUInt8(OutRoomPacketType.SetHost)

        OutRoomSetHost.build(userId, packet)

        return packet
    }

    public static setGameResult(): OutRoomPacket {
        const packet: OutRoomPacket = new OutRoomPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 30,
            incrementAmount: 15
        })

        packet.buildHeader()
        packet.writeUInt8(OutRoomPacketType.SetGameResult)

        OutRoomGameResult.build(packet)

        return packet
    }

    public static progressCountdown(countdown: number): OutRoomPacket {
        const packet: OutRoomPacket = new OutRoomPacket()
        packet.outStream = new WritableStreamBuffer({
            initialSize: 20,
            incrementAmount: 15
        })

        packet.buildHeader()
        packet.writeUInt8(OutRoomPacketType.Countdown)

        OutRoomCountdown.build(true, countdown, packet)

        return packet
    }

    public static stopCountdown(): OutRoomPacket {
        const packet: OutRoomPacket = new OutRoomPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 20,
            incrementAmount: 15
        })

        packet.buildHeader()
        packet.writeUInt8(OutRoomPacketType.Countdown)

        OutRoomCountdown.build(false, null, packet)

        return packet
    }

    public static setUserTeam(userId: number, teamNum: number): OutRoomPacket {
        const packet: OutRoomPacket = new OutRoomPacket()

        packet.outStream = new WritableStreamBuffer({
            initialSize: 20,
            incrementAmount: 15
        })

        packet.buildHeader()
        packet.writeUInt8(OutRoomPacketType.setUserTeam)

        OutRoomSetUserTeam.build([userId], [teamNum], packet)

        return packet
    }
    constructor() {
        super(PacketId.Room)
    }
}
