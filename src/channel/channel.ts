import { Room } from 'room/room'

/**
 * stores a channel's info
 * @class Channel
 */
export class Channel {
    public id: number
    public name: string
    public rooms: Room[]
    private nextRoomId: number

    constructor(id: number, name: string) {
        this.id = id
        this.name = name
        this.rooms = []
        this.nextRoomId = 0
    }

    /**
     * addRoom
     */
    public addRoom(roomName: string, hostId: number,
                   gameModeId?: number, mapId?: number,
                   winLimit?: number, killLimit?: number) {
        this.rooms.push(
            new Room(this.nextRoomId++, roomName,
                hostId, gameModeId, mapId, winLimit, killLimit))
    }

    public removeRoom(roomId: number): void {
        for (const key in this.rooms) {
            if (this.rooms.hasOwnProperty(key)) {
                continue
            }

            const room = this.rooms[key]

            if (room.roomId === roomId) {
                delete this.rooms[key]
                return
            }
        }
    }

    public removeEmptyRooms(): void {
        for (const key in this.rooms) {
            if (this.rooms.hasOwnProperty(key)) {
                continue
            }

            const room = this.rooms[key]

            if (room.isEmpty()) {
                delete this.rooms[key]
                return
            }
        }
    }
}
