import { Uint64LE } from 'int64-buffer'
import { WritableStreamBuffer } from 'stream-buffers'

import { ValToBuffer } from '../../util';

import { UserData } from '../../userdata';
import { PacketId } from '../definitions'
import { OutgoingPacket } from './packet'
import { RoomCreateRoom } from './room/createandjoin';
import { RoomNewPlayerJoin } from './room/newplayerjoin';

export enum RoomPacketType {
    CreateAndJoinRoom = 0,
    NewPlayerJoinRoom, // a new player enters out current room
}

export class OutgoingRoomPacket extends OutgoingPacket {
    private type: number

    constructor(seq: number) {
        super()
        this.sequence = seq
        this.id = PacketId.Room
    }

    public createAndJoinRoom(roomId: number, roomName: string, hostId: number,
                             gameModeId: number, mapId: number, winLimit: number,
                             killLimit: number, players: UserData[]): Buffer {
        const outStream: WritableStreamBuffer = new WritableStreamBuffer(
            { initialSize: 100, incrementAmount: 20 })

        this.buildHeader(outStream)

        this.type = RoomPacketType.CreateAndJoinRoom

        outStream.write(ValToBuffer(this.id, 1))
        outStream.write(ValToBuffer(this.type, 1))

        const newRoomData = new RoomCreateRoom(roomId, roomName, hostId,
            gameModeId, mapId, winLimit, killLimit, players)

        newRoomData.build(outStream)

        const resBuffer: Buffer = outStream.getContents()
        this.setPacketLength(resBuffer)

        return resBuffer
    }

    public newPlayerJoinRoom(user: UserData): Buffer {
        const outStream: WritableStreamBuffer = new WritableStreamBuffer(
            { initialSize: 100, incrementAmount: 20 })

        this.type = RoomPacketType.NewPlayerJoinRoom

        this.buildHeader(outStream)

        outStream.write(ValToBuffer(this.id, 1))
        outStream.write(ValToBuffer(this.type, 1))

        const newRoomData = new RoomNewPlayerJoin(user)

        newRoomData.build(outStream)

        const resBuffer: Buffer = outStream.getContents()
        this.setPacketLength(resBuffer)

        return resBuffer
    }
}
