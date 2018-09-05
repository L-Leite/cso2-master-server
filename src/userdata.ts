import { Uint64LE } from 'int64-buffer';

export class UserData {
    public uuid: string
    public ip: string
    public port: number
    public userId: number
    public userName: string
    public level: number
    public curExp: Uint64LE
    public maxExp: Uint64LE
    public wins: number
    public kills: number
    public deaths: number
    public assists: number

    constructor(uuid: string, userId: number, userName: string) {
        this.uuid = uuid
        this.userId = userId
        this.userName = userName
        this.level = 2
        this.curExp = new Uint64LE(0)
        this.maxExp = new Uint64LE(1000)
        this.wins = 4
        this.kills = 2
        this.deaths = 1
        this.assists = 3
    }
}
