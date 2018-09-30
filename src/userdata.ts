import { Uint64LE } from 'int64-buffer'

export class UserData {
    public uuid: string
    public userId: number

    public externalIpAddress: string
    public port: number

    public externalClientPort: number
    public externalServerPort: number
    public externalTvPort: number
    public localIpAddress: string
    public localClientPort: number
    public localServerPort: number
    public localTvPort: number

    public userName: string
    public level: number
    public curExp: Uint64LE
    public maxExp: Uint64LE
    public wins: number
    public kills: number
    public deaths: number
    public assists: number

    constructor(uuid: string, externalIp: string, userId: number, userName: string) {
        this.uuid = uuid
        this.externalIpAddress = externalIp
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

    /**
     * set holepunch client ports
     */
    public setHpClientInfo(localClientPort: number,
                           externalClientPort: number): void {
        this.localClientPort = localClientPort
        this.externalClientPort = externalClientPort
    }

    /**
     * set holepunch server ports
     */
    public setHpServerInfo(localServerPort: number,
                           externalServerPort: number): void {
        this.localServerPort = localServerPort
        this.externalServerPort = externalServerPort
    }

    /**
     * set holepunch SourceTV ports
     */
    public setHpTvInfo(localTvPort: number,
                       externalTvPort: number): void {
        this.localTvPort = localTvPort
        this.externalTvPort = externalTvPort
    }
}
