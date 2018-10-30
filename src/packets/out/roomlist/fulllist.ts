import { OutPacketBase } from 'packets/out/packet'

import { RoomListRoomData } from 'packets/out/roomlist/roomdata'

/**
 * Sub structure of RoomList packet
 * send the full info about a room list
 * @class RoomListFullList
 */
export class RoomListFullList {
    private roomCount: number
    private rooms: RoomListRoomData[]

    constructor() {
        this.roomCount = 1
        this.rooms = []
        this.rooms.push(new RoomListRoomData())
    }
    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt16(this.roomCount)

        this.rooms.forEach((room: RoomListRoomData) => {
            room.build(outPacket)
        });
    }
}
