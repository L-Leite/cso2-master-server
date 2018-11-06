import { IRoomOptions, Room } from 'room/room'

import { User } from 'user/user'

import { OutLobbyPacket } from 'packets/out/lobby'
import { OutRoomListPacket } from 'packets/out/roomlist'

/**
 * stores and processes channel data
 * @class Channel
 */
export class Channel {
    /**
     * a callback function used by the rooms when a room is empty
     * @param emptyRoom the empty room object
     * @param channel the channel where the room's from
     */
    private static onEmptyRoomCallback(emptyRoom: Room, channel: Channel): void {
        channel.rooms.splice(channel.rooms.indexOf(emptyRoom), 1)
    }

    public index: number
    public name: string
    public rooms: Room[]
    private nextRoomId: number

    constructor(index: number, name: string) {
        this.index = index
        this.name = name
        this.rooms = []
        this.nextRoomId = 1
    }

    /**
     * build a room list packet for the user
     * @param seq the packet's sequence number
     * @returns the packet
     */
    public buildRoomListPacket(seq: number): Buffer {
        const lobbyPacket: Buffer = new OutLobbyPacket(seq).doSomething()
        const listPacket: Buffer = new OutRoomListPacket(seq).getFullList(this.rooms)
        return Buffer.concat([lobbyPacket, listPacket])
    }

    /**
     * get an existing room by its id
     * @param id the desired room's id
     * @returns the room's object if found, otherwise null
     */
    public getRoomById(id: number): Room {
        for (const room of this.rooms) {
            if (room.id === id) {
                return room
            }
        }
        return null
    }

    /**
     * add a room to the channel
     * @param host the room's host user
     * @param options the room's parameters
     * @returns the created room
     */
    public createRoom(host: User, options?: IRoomOptions): Room {
        this.rooms.push(
            new Room(this.nextRoomId++, host, this, Channel.onEmptyRoomCallback, options))
        return this.rooms[this.rooms.length - 1]
    }

    /**
     * remove a room by its id
     * @param roomId the room's id
     */
    public removeRoomById(roomId: number): void {
        for (const room of this.rooms) {
            if (room.id === roomId) {
                this.rooms.splice(this.rooms.indexOf(room), 1)
                return
            }
        }
    }
}
