import { OutPacketBase } from 'packets/out/packet'

import { RoomListItem } from 'packets/out/roomlist/item'

import { Room } from 'room/room'

/**
 * sends out channel's rooms to an user
 */
export class RoomListCollection {
    private roomCount: number
    private rooms: RoomListItem[]

    constructor(rooms: Room[]) {
        this.roomCount = rooms.length
        this.rooms = []
        for (const room of rooms) {
            this.rooms.push(new RoomListItem(room))
        }
    }
    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt16(this.roomCount)

        for (const room of this.rooms) {
            room.build(outPacket)
        }
    }
}
