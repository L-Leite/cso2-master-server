import { Uint64LE } from 'int64-buffer'

import { HolepunchType } from 'packets/holepunch/inholepunch'

import { Room } from 'room/room'

import { ExtendedSocket } from 'extendedsocket'

import { UserInventory } from 'user/userinventory'

export class User {
    public socket: ExtendedSocket
    public userId: number

    public externalIpAddress: string

    public externalClientPort: number
    public externalServerPort: number
    public externalTvPort: number
    public localIpAddress: string
    public localClientPort: number
    public localServerPort: number
    public localTvPort: number

    public currentChannelServerIndex: number
    public currentChannelIndex: number
    public currentRoom: Room

    public userName: string
    public level: number
    public curExp: Uint64LE
    public maxExp: Uint64LE
    public rank: number
    public viplevel: number
    public wins: number
    public kills: number
    public deaths: number
    public assists: number

    public inventory: UserInventory

    constructor(socket: ExtendedSocket, userId: number, userName: string) {
        this.socket = socket
        this.userId = userId

        this.externalIpAddress = socket.remoteAddress
        this.externalClientPort = 0
        this.externalServerPort = 0
        this.externalTvPort = 0

        this.localIpAddress = ''
        this.localClientPort = 0
        this.localServerPort = 0
        this.localTvPort = 0

        this.currentChannelServerIndex = 0
        this.currentChannelIndex = 0

        this.userName = userName
        this.level = Math.floor(Math.random() * Math.floor(100))
        this.rank = Math.floor(Math.random() * Math.floor(21))
        this.viplevel = Math.floor(Math.random() * Math.floor(7))
        this.curExp = new Uint64LE(Math.floor(Math.random() * Math.floor(1000000)))
        this.maxExp = new Uint64LE(1000000)
        this.wins = 0
        this.kills = Math.floor(Math.random() * Math.floor(100000))
        this.deaths = Math.floor(Math.random() * Math.floor(100000))
        this.assists = Math.floor(Math.random() * Math.floor(100000))

        this.inventory = new UserInventory()
    }

    public setCurrentChannelIndex(channelServerIndex: number, channelIndex: number): void {
        this.currentChannelServerIndex = channelServerIndex
        this.currentChannelIndex = channelIndex
    }

    public updateHolepunch(portId: number, localPort: number,
                           externalPort: number): number {
        switch (portId) {
            case HolepunchType.Client:
                this.localClientPort = localPort
                this.externalClientPort = externalPort
                return 0
            case HolepunchType.Server:
                this.localServerPort = localPort
                this.externalServerPort = externalPort
                return 1
            case HolepunchType.SourceTV:
                this.localTvPort = localPort
                this.externalTvPort = externalPort
                return 2
            default:
                return -1
        }
    }
}
