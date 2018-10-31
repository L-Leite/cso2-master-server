import { User } from 'user/user'

export interface IRoomOptions {
    roomName?: string,
    gameModeId?: number,
    mapId?: number,
    winLimit?: number,
    killLimit?: number,
    startMoney?: number,
    forceCamera?: number,
    nextMapEnabled?: number,
    changeTeams?: number,
    enableBots?: number,
    difficulty?: number
}

export class Room {
    public id: number
    public roomName: string
    public maxPlayers: number
    public gameModeId: number
    public mapId: number
    public winLimit: number
    public killLimit: number
    public startMoney: number
    public forceCamera: number
    public nextMapEnabled: number
    public changeTeams: number
    public enableBots: number
    public difficulty: number
    public host: User
    public users: User[]

    constructor(roomId: number, host: User,
                options?: IRoomOptions) {
        this.id = roomId
        this.host = host

        this.roomName = options.roomName ? options.roomName : 'Room #' + this.id
        this.gameModeId = options.gameModeId ? options.gameModeId : 0
        this.mapId = options.mapId ? options.mapId : 1
        this.winLimit = options.winLimit ? options.winLimit : 10
        this.killLimit = options.killLimit ? options.killLimit : 150
        this.startMoney = options.startMoney ? options.startMoney : 16000
        this.forceCamera = options.forceCamera ? options.forceCamera : 1
        this.nextMapEnabled = options.nextMapEnabled ? options.nextMapEnabled : 0
        this.changeTeams = options.changeTeams ? options.changeTeams : 0
        this.enableBots = options.enableBots ? options.enableBots : 0
        this.difficulty = options.difficulty ? options.difficulty : 0

        this.users = [host]
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
                this.users.splice(this.users.indexOf(user), 1)
                return
            }
        }
    }

    public isEmpty(): boolean {
        return this.users.length === 0
    }
}
