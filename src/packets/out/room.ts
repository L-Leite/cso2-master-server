import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'

import { Room } from 'room/room'
import { User } from 'user/user'

import { RoomCreateAndJoinRoom } from 'packets/out/room/createandjoin'
import { RoomNewPlayerJoin } from 'packets/out/room/newplayerjoin'

export enum OutRoomPacketType {
    CreateAndJoinRoom = 0,
    NewPlayerJoinRoom = 1, // a new player enters out current room
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

        new RoomCreateAndJoinRoom(roomInfo).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }

    public newPlayerJoinRoom(user: User): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 60, incrementAmount: 15 })

        this.buildHeader()
        this.writeUInt8(OutRoomPacketType.NewPlayerJoinRoom)

        new RoomNewPlayerJoin(user).build(this)

        const res: Buffer = this.outStream.getContents()
        OutPacketBase.setPacketLength(res)

        return res
    }
}
