import { IRoomOptions, Room } from 'room/room'

import { User } from 'user/user'

import { OutLobbyPacket } from 'packets/out/lobby'
import { OutRoomListPacket } from 'packets/out/roomlist'

/**
 * stores a channel's info
 * @class Channel
 */
export class Channel {
    public index: number
    public name: string
    public rooms: Room[]
    private nextRoomId: number

    constructor(index: number, name: string) {
        this.index = index
        this.name = name
        this.rooms = []
        this.nextRoomId = 0
    }

    /**
     * buildRoomListPacket
     */
    public buildRoomListPacket(seq: number): Buffer {
        const lobbyPacket: Buffer = new OutLobbyPacket(seq).doSomething()
        const listPacket: Buffer = new OutRoomListPacket(seq).getFullList(this.rooms)
        return Buffer.concat([lobbyPacket, listPacket])
    }

    /**
     * addRoom
     */
    public addRoom(host: User, options?: IRoomOptions) {
        this.rooms.push(
            new Room(this.nextRoomId++, host, options))
    }

    public removeRoom(roomId: number): void {
        for (const key in this.rooms) {
            if (this.rooms.hasOwnProperty(key)) {
                const room = this.rooms[key]

                if (room.id === roomId) {
                    this.rooms.splice(this.rooms.indexOf(room), 1)
                    return
                }
            }
        }
    }

    public removeEmptyRooms(): void {
        for (const key in this.rooms) {
            if (this.rooms.hasOwnProperty(key)) {
                const room = this.rooms[key]

                if (room.isEmpty()) {
                    this.rooms.splice(this.rooms.indexOf(room), 1)
                    return
                }
            }
        }
    }
}
