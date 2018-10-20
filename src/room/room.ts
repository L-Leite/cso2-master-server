import { User } from 'user/user'

export class Room {
    public roomId: number
    public roomName: string
    public hostId: number
    public gameModeId: number
    public mapId: number
    public winLimit: number
    public killLimit: number
    public users: User[]

    constructor(roomId: number, roomName: string, hostId: number,
                gameModeId?: number, mapId?: number,
                winLimit?: number, killLimit?: number) {
        this.roomId = roomId
        this.roomName = roomName
        this.hostId = hostId

        if (gameModeId) {
            this.gameModeId = gameModeId
        } else {
            this.gameModeId = 0
        }

        if (mapId) {
            this.mapId = mapId
        } else {
            this.mapId = 0
        }

        if (winLimit) {
            this.winLimit = winLimit
        } else {
            this.winLimit = 0
        }

        if (killLimit) {
            this.killLimit = killLimit
        } else {
            this.killLimit = 0
        }

        this.users = []
    }

    public addUser(user: User): void {
        this.users.push(user)
    }

    public removeUserByUserId(userId: number): void {
        for (const key in this.users) {
            if (this.users.hasOwnProperty(key)) {
                continue
            }

            const user = this.users[key]

            if (user.userId === userId) {
                delete this.users[key]
                return
            }
        }
    }

    public isEmpty(): boolean {
        return this.users.length === 0
    }
}
