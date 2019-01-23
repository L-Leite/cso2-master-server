import { OutPacketBase } from 'packets/out/packet'

import { RoomListRoomData } from 'packets/out/roomlist/roomdata'

import { Room } from 'room/room'

/**
 * sends out channel's rooms to an user
 * @class RoomListFullList
 */
export class RoomListFullList {
    private roomCount: number
    private rooms: RoomListRoomData[]

    constructor(rooms: Room[]) {
        this.roomCount = rooms.length
        this.rooms = []
        for (const room of rooms) {
            this.rooms.push(new RoomListRoomData(room))
        }
    }
    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt16(this.roomCount)

        for (const room of this.rooms) {
            room.build(outPacket)
        }
    }
}
