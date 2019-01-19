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

// pasted from scripts/cso2_modlist.csv
export enum RoomGamemode {
    original = 1,
    teamdeath = 2,
    zombie = 3,
    stealth = 4,
    gunteamdeath = 5,
    tutorial = 6,
    hide = 7,
    pig = 8,
    animationtest_vcd = 9,
    gz_survivor = 10,
    devtest = 11,
    originalmr = 12,
    originalmrdraw = 13,
    casualbomb = 14,
    deathmatch = 15,
    scenario_test = 16,
    gz = 17,
    gz_intro = 18,
    gz_tour = 19,
    gz_pve = 20,
    eventmod01 = 21,
    duel = 22,
    gz_ZB = 23,
    heroes = 24,
    eventmod02 = 25,
    zombiecraft = 26,
    campaign1 = 27,
    campaign2 = 28,
    campaign3 = 29,
    campaign4 = 30,
    campaign5 = 31,
    campaign6 = 32,
    campaign7 = 33,
    campaign8 = 34,
    campaign9 = 35,
    z_scenario = 36,
    zombie_prop = 37,
    ghost = 38,
    tag = 39,
    hide_match = 40,
    hide_ice = 41,
    diy = 42,
    hide_Item = 43,
    zd_boss1 = 44,
    zd_boss2 = 45,
    zd_boss3 = 46,
    practice = 47,
    zombie_commander = 48,
    casualoriginal = 49,
    hide2 = 50,
    gunball = 51,
    zombie_zeta = 53,
    tdm_small = 54,
    de_small = 55,
    gunteamdeath_re = 56,
    endless_wave = 57,
    rankmatch_original = 58,
    rankmatch_teamdeath = 59,
    play_ground = 60,
    madcity = 61,
    hide_origin = 62,
    teamdeath_mutation = 63,
    giant = 64,
    z_scenario_side = 65,
    hide_multi = 66,
    madcity_team = 67,
    rankmatch_stealth = 68,
}

export enum RoomTeamBalance {
    Disabled = 0,
    Enabled = 1,
    WithBots = 2,
    ByKadRatio = 4,
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
const invalidEntityNum: number = -1

export class Room {
    public id: number
    public settings: RoomSettings

    public host: User
    public users: User[]
    public userTeam: Map<number, RoomTeamNum>
    public userReadyStatus: Map<number, RoomReadyStatus>
    public userEntityNum: Map<number, number>

    private emptyRoomCallback: (emptyRoom: Room, channel: Channel) => void
    private parentChannel: Channel

    private countingDown: boolean
    private countdown: number

    constructor(roomId: number, host: User, parentChannel: Channel,
                emptyRoomCallback?: (emptyRoom: Room, channel: Channel) => void,
                options?: IRoomOptions) {
        this.id = roomId
        this.host = host
        this.userTeam = new Map<number, RoomTeamNum>()
        this.userReadyStatus = new Map<number, RoomReadyStatus>()
        this.userEntityNum = new Map<number, number>()

        this.parentChannel = parentChannel
        this.emptyRoomCallback = emptyRoomCallback

        this.settings = new RoomSettings(options)

        this.countingDown = false
        this.countdown = defaultCountdownNum

        this.users = []
        this.addUser(host, this.findDesirableTeamNum())
    }

    /**
     * gives the ammount of players (including bots)
     * @returns the ammount of players
     */
    public getNumOfPlayers(): number {
        const realPlayers: number = this.users.length
        const botPlayers: number = this.settings.numCtBots + this.settings.numTrBots
        return realPlayers + botPlayers
    }

    /**
     * gives the ammount of player slots available in the room
     * @returns the free player slots
     */
    public getFreeSlots(): number {
        const availableSlots: number = this.settings.maxPlayers - this.getNumOfPlayers()
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
        this.userEntityNum.set(user.userId, invalidEntityNum)
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
                throw new Error('Room::findDesirableTeamNum: Unknown team number')
            }
        }

        if (trNum < ctNum) {
            return RoomTeamNum.Terrorist
        } else {
            return RoomTeamNum.CounterTerrorist
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
     * gives the number of playersthat are ready
     * @returns the num of players ready
     */
    public getNumOfReadyRealPlayers(): number {
        let numReadyPlayers: number = 0
        for (const user of this.users) {
            if (this.isUserReady(user) === true
                || user === this.host) {
                numReadyPlayers++
            }
        }

        return numReadyPlayers
    }

    /**
     * gives the number of elements in the counter terrorist team
     */
    public getNumOfRealCts(): number {
        let numCt: number = 0
        for (const team of this.userTeam.values()) {
            if (team === RoomTeamNum.CounterTerrorist) {
                numCt++
            }
        }

        return numCt
    }

    /**
     * gives the number of elements in the terrorist team
     */
    public getNumOfRealTerrorists(): number {
        let numTerrorists: number = 0
        for (const team of this.userTeam.values()) {
            if (team === RoomTeamNum.Terrorist) {
                numTerrorists++
            }
        }

        return numTerrorists
    }

    /**
     * gives the number of players (bots included) that are ready
     * @returns the num of players ready
     */
    public getNumOfReadyPlayers(): number {
        let botPlayers: number = this.settings.numCtBots + this.settings.numTrBots

        if (this.settings.teamBalance === RoomTeamBalance.WithBots) {
            const numCts: number = this.getNumOfRealCts()
            const numTer: number = this.getNumOfRealTerrorists()

            const requiredBalanceBots: number = Math.abs(numCts - numTer)
            botPlayers = Math.max(botPlayers, requiredBalanceBots)
        }

        return this.getNumOfReadyRealPlayers() + botPlayers
    }

    /**
     * returns an user's ready status
     * @param user the user's object
     */
    public getUserReadyStatus(user: User): RoomReadyStatus {
        if (this.hasUser(user) === false) {
            console.warn('getUserReady: user not found!')
            return RoomReadyStatus.No
        }
        return this.userReadyStatus.get(user.userId)
    }

    /**
     * returns true if an user is ready, false if not
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
     * gives an user's entity number in a room match
     * if the user hasn't set the entity number, returns 'invalidEntityNum' (-1)
     * @param user the target user
     * @returns the user's entity number
     */
    public getUserEntityNum(user: User): number {
        const result = this.userEntityNum.get(user.userId)

        if (result == null) {
            console.warn('Room::getUserEntityNum: user %s did not set its entity id',
                user.userName)
            return invalidEntityNum
        }

        return result
    }

    /**
     * sets an user ingame entity number
     * @param user the target user
     * @param entityNum the new entity number
     */
    public setUserEntityNum(user: User, entityNum: number): void {
        if (this.hasUser(user) === false) {
            console.warn('Room::setUserEntityNum: user %s isn\'t in room %s',
                user.userName, this.settings.roomName)
            return
        }

        this.userEntityNum.set(user.userId, entityNum)
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
            console.warn('toggleUserReadyStatus: user not found!')
            return
        }

        if (user === this.host) {
            console.warn('toggleUserReadyStatus: host tried to toggle ready')
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
     * progress through the 'game start' countdown
     * the room's host must send countdown requests in order to progress it
     * TODO: maybe do the countdown without depending on the room's host
     * @param hostNextNum the host's next countdown number
     */
    public progressCountdown(hostNextNum: number): number {
        this.countingDown = true

        if (this.countdown > defaultCountdownNum
            || this.countdown < 0) {
            console.warn('Room: the saved countdown is invalid!')
            this.countdown = 0
        }

        if (this.countdown !== hostNextNum) {
            console.warn('Room: host\'s countdown does not match ours')
        }

        return this.countdown--
    }

    public getCountdown(): number {
        return this.countdown
    }

    /**
     * checks if a room's game countdown is in progress
     * @returns true if it's in progress, false if not
     */
    public isCountdownInProgress(): boolean {
        return this.countingDown
    }

    /**
     * stops and resets the 'game start' countdown
     */
    public stopCountdown(): void {
        this.countingDown = false
        this.countdown = defaultCountdownNum
    }

    /**
     * can we start counting down until the game start?
     * @returns true if we can countdown, else false
     */
    public canStartGame(): boolean {
        const gamemode: RoomGamemode = this.settings.gameModeId

        switch (gamemode) {
            case RoomGamemode.deathmatch:
            case RoomGamemode.original:
            case RoomGamemode.originalmr:
            case RoomGamemode.gunteamdeath:
            case RoomGamemode.gunteamdeath_re:
            case RoomGamemode.stealth:
            case RoomGamemode.teamdeath:
            case RoomGamemode.teamdeath_mutation:
                if (this.getNumOfReadyPlayers() < 2) {
                    return false
                }
                break
            case RoomGamemode.giant:
            case RoomGamemode.hide:
            case RoomGamemode.hide2:
            case RoomGamemode.hide_origin:
            case RoomGamemode.hide_Item:
            case RoomGamemode.hide_multi:
            case RoomGamemode.pig:
            case RoomGamemode.tag:
            case RoomGamemode.zombie:
            case RoomGamemode.zombiecraft:
            case RoomGamemode.zombie_commander:
            case RoomGamemode.zombie_prop:
            case RoomGamemode.zombie_zeta:
            case RoomGamemode.z_scenario_side:
                if (this.getNumOfReadyRealPlayers() < 2) {
                    return false
                }
                break
            case RoomGamemode.endless_wave:
            case RoomGamemode.play_ground:
            case RoomGamemode.practice:
            default:
                break
        }

        return true
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
