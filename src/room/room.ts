import { Channel } from 'channel/channel'
import { User } from 'user/user'

import { RoomSettings } from 'room/roomsettings'

import { OutRoomPacket } from 'packets/out/room'

export enum RoomTeamNum {
    Unknown = 0,
    Terrorist = 1,
    CounterTerrorist = 2,
}

export enum RoomReadyStatus {
    No = 0,
    Unknown = 1, // readies the player, but you can't unready
    Yes = 2,
}

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
    respawnTime?: number
    teamBalance?: number
    weaponRestrictions?: number
    hltvEnabled?: number
}

const defaultCountdownNum: number = 6

export class Room {
    public id: number
    public settings: RoomSettings

    public host: User
    public users: User[]
    public userTeam: Map<number, RoomTeamNum>
    public userReadyStatus: Map<number, RoomReadyStatus>

    private emptyRoomCallback: (emptyRoom: Room, channel: Channel) => void
    private parentChannel: Channel

    private countdown: number

    constructor(roomId: number, host: User, parentChannel: Channel,
                emptyRoomCallback?: (emptyRoom: Room, channel: Channel) => void,
                options?: IRoomOptions) {
        this.id = roomId
        this.host = host
        this.userTeam = new Map<number, RoomTeamNum>()
        this.userReadyStatus = new Map<number, RoomReadyStatus>()

        this.parentChannel = parentChannel
        this.emptyRoomCallback = emptyRoomCallback

        this.settings = new RoomSettings(options)

        this.countdown = defaultCountdownNum

        this.users = []
        this.addUser(host, this.findDesirableTeamNum())
    }

    /**
     * returns the ammount of player slots available in the room
     * @returns the free player slots
     */
    public getFreeSlots(): number {
        const availableSlots: number = this.settings.maxPlayers - this.users.length
        return availableSlots >= 0 ? availableSlots : 0
    }

    /**
     * does this room have free player slots?
     */
    public hasFreeSlots(): boolean {
        return this.getFreeSlots() !== 0
    }

    /**
     * is the user in the room?
     * @param user the user objects to find
     */
    public hasUser(user: User): boolean {
        return this.users.find((u: User) => u === user) != null
    }

    /**
     * add an user to a room
     * @param user the user object to add
     */
    public addUser(user: User, teamNum: RoomTeamNum): void {
        this.users.push(user)
        this.userTeam.set(user.userId, teamNum)
        this.userReadyStatus.set(user.userId, RoomReadyStatus.No)
    }

    /**
     * remove an user from a room
     * @param targetUser the user object to remove
     */
    public removeUser(targetUser: User): void {
        for (const user of this.users) {
            if (user === targetUser) {
                const userId = user.userId
                this.users.splice(this.users.indexOf(user), 1)
                this.onUserRemoved(userId)
                return
            }
        }
    }

    /**
     * remove an user from a room by its user id
     * @param targetUser the user's id to remove
     */
    public removeUserById(userId: number): void {
        for (const user of this.users) {
            if (user.userId === userId) {
                this.users.splice(this.users.indexOf(user), 1)
                this.onUserRemoved(userId)
                return
            }
        }
    }

    /**
     * returns an user's current team
     * @param user the user's object
     */
    public getUserTeam(user: User): RoomTeamNum {
        if (this.hasUser(user) === false) {
            console.warn('getUserTeam: user not found!')
            return RoomTeamNum.Unknown
        }
        return this.userTeam.get(user.userId)
    }

    /**
     * returns an user's ready status
     * @param user the user's object
     */
    public isUserReady(user: User): boolean {
        if (this.hasUser(user) === false) {
            console.warn('isUserReady: user not found!')
            return false
        }
        return this.userReadyStatus.get(user.userId) === RoomReadyStatus.Yes
    }

    /**
     * checks if the room's users are ready
     * @returns true if everyone is ready, false if not
     */
    public isRoomReady(): boolean {
        for (const user of this.users) {
            if (this.isUserReady(user) === false) {
                return false
            }
        }
        return true
    }

    /**
     * swaps an user to the opposite team
     * @param user the user's object
     * @param newTeam the user's new team
     */
    public setUserToTeam(user: User, newTeam: RoomTeamNum): void {
        if (this.hasUser(user) === false) {
            console.warn('setUserToTeam: user not found!')
            return
        }
        this.userTeam.set(user.userId, newTeam)
    }

    /**
     * toggles the user's room ready status
     * @param user the user's object
     * @param newStatus the user's new ready status
     * @returns the new ready state
     */
    public toggleUserReadyStatus(user: User): RoomReadyStatus {
        if (this.hasUser(user) === false) {
            console.warn('setUserReadyStatus: user not found!')
            return
        }

        const curStatus: RoomReadyStatus = this.userReadyStatus.get(user.userId)
        const newStatus: RoomReadyStatus =
            curStatus === RoomReadyStatus.No
                ? RoomReadyStatus.Yes : RoomReadyStatus.No
        this.userReadyStatus.set(user.userId, newStatus)
        return newStatus
    }

    /**
     * count the ammount of users on each team and returns the team with less users
     * @returns the team with less users
     */
    public findDesirableTeamNum(): RoomTeamNum {
        let trNum: number = 0
        let ctNum: number = 0

        for (const team of this.userTeam.values()) {
            if (team === RoomTeamNum.Terrorist) {
                trNum++
            } else if (team === RoomTeamNum.CounterTerrorist) {
                ctNum++
            } else {
                throw new Error('Unknown team number, debug me!')
            }
        }

        if (trNum < ctNum) {
            return RoomTeamNum.Terrorist
        } else {
            return RoomTeamNum.CounterTerrorist
        }
    }

    /**
     * progress through the 'game start' countdown
     * @param hostNextNum the host's next countdown number
     */
    public progressCountdown(hostNextNum: number): void {
        if (this.countdown > defaultCountdownNum
            || this.countdown <= 0) {
            throw new Error('Room: the saved countdown is invalid!')
        }

        this.countdown--

        if (this.countdown !== hostNextNum) {
            throw new Error('Room: host\'s countdown does not match ours')
        }
    }

    /**
     * checks if a room's game countdown is in progress
     * @returns true if it's in progress, false if not
     */
    public isCountdownInProgress(): boolean {
        return this.countdown < defaultCountdownNum
            || this.countdown > 0
    }

    /**
     * stops and resets the 'game start' countdown
     */
    public stopCountdown(): void {
        this.countdown = defaultCountdownNum
    }

    /**
     * called when an user is succesfully removed
     * if the room is empty, inform the channel to delete us
     * else, find a new host
     * @param userId the user's id
     */
    private onUserRemoved(userId: number): void {
        if (this.users.length === 0) {
            this.emptyRoomCallback(this, this.parentChannel)
        } else {
            this.findAndUpdateNewHost()
            this.userTeam.delete(userId)
            this.userReadyStatus.delete(userId)
            this.sendRemovedUser(userId)
        }
    }

    /**
     * inform the users about an user being removed
     * @param userId the removed user's ID
     */
    private sendRemovedUser(userId: number) {
        for (const user of this.users) {
            const reply: Buffer =
                new OutRoomPacket(user.socket.getSeq())
                    .playerLeave(userId);
            user.socket.send(reply)
        }
    }

    /**
     * sets the new room host and tells the users about it
     * @param newHost the new host user
     */
    private updateHost(newHost: User): void {
        this.host = newHost

        for (const user of this.users) {
            const reply: Buffer =
                new OutRoomPacket(user.socket.getSeq())
                    .setHost(this.host)
            user.socket.send(reply)
        }
    }

    /**
     * assign the first available user as a host,
     * and updates the users about it
     * only if the room isn't empty
     * @returns true if a new host was found, false if not
     */
    private findAndUpdateNewHost(): boolean {
        if (this.users.length === 0) {
            return false
        }

        this.updateHost(this.users[0])
        return true
    }
}
