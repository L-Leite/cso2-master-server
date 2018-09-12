import { UserData } from './userdata'

export class RoomData {
    public roomId: number
    public roomName: string
    public hostId: number
    public gameModeId: number
    public mapId: number
    public winLimit: number
    public killLimit: number
    public users: UserData[]

    constructor(roomId: number, roomName: string, hostId: number,
                gameModeId: number, mapId: number,
                winLimit: number, killLimit: number) {
        this.roomId = roomId
        this.roomName = roomName
        this.hostId = hostId
        this.gameModeId = gameModeId
        this.mapId = mapId
        this.winLimit = winLimit
        this.killLimit = killLimit
        this.users = []
    }

    public addUser(user: UserData) {
        this.users.push(user)
    }
}
