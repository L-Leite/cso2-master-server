import { Uint64LE } from 'int64-buffer';
import { UserData } from './userdata';

export class RoomData {
    public roomId: number
    public roomName: string
    public hostId: number
    public gameModeId: number
    public mapId: number
    public winLimit: number
    public killLimit: number
    public players: UserData[]

    constructor(roomId: number, roomName: string, hostId: number) {
        this.roomId = roomId
        this.roomName = roomName
        this.hostId = hostId
        this.gameModeId = 0x2F
        this.mapId = 3
        this.winLimit = 10
        this.killLimit = 10
        this.players = []
    }

    public addPlayer(user: UserData) {
        this.players.push(user)
    }
}
