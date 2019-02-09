import { Channel } from 'channel/channel'
import { User } from 'user/user'

import { NewRoomSettings } from 'room/newroomsettings'
import { RoomSettings } from 'room/roomsettings'
import { RoomUser } from 'room/roomuser'

import { OutHostPacket } from 'packets/out/host'
import { OutRoomPacket } from 'packets/out/room'
import { OutUdpPacket } from 'packets/out/udp'

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

export enum RoomStatus {
    Waiting = 1,
    Ingame = 2,
}

const defaultCountdownNum: number = 7

export class Room {
    public id: number
    public settings: RoomSettings

    public host: User
    public users: User[]
    public usersInfo: Map<User, RoomUser>

    private emptyRoomCallback: (emptyRoom: Room, channel: Channel) => void
    private parentChannel: Channel

    private status: RoomStatus

    private countingDown: boolean
    private countdown: number

    constructor(roomId: number, host: User, parentChannel: Channel,
                emptyRoomCallback?: (emptyRoom: Room, channel: Channel) => void,
                options?: IRoomOptions) {
        this.id = roomId
        this.host = host

        this.usersInfo = new Map<User, RoomUser>()

        this.parentChannel = parentChannel
        this.emptyRoomCallback = emptyRoomCallback

        this.settings = new RoomSettings(options)

        this.status = RoomStatus.Waiting

        this.countingDown = false
        this.countdown = defaultCountdownNum

        this.users = []
        this.addUser(host)
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
     * @returns true if so, false if not
     */
    public hasFreeSlots(): boolean {
        return this.getFreeSlots() !== 0
    }

    /**
     * is the user in the room?
     * @param user the user objects to find
     * @returns true the user is found, false if not
     */
    public hasUser(user: User): boolean {
        return this.users.find((u: User) => u === user) != null
    }

    /**
     * add an user to a room
     * @param user the user object to add
     */
    public addUser(user: User): void {
        const userData: RoomUser = new RoomUser(this.findDesirableTeamNum(),
            RoomReadyStatus.No)
        this.users.push(user)
        this.usersInfo.set(user, userData)
    }

    /**
     * remove an user from a room
     * @param targetUser the user object to remove
     */
    public removeUser(targetUser: User): void {
        for (const user of this.users) {
            if (user === targetUser) {
                this.usersInfo.delete(user)
                this.users.splice(this.users.indexOf(user), 1)
                this.onUserRemoved(user)
                return
            }
        }
    }

    /**
     * count the ammount of users on each team and returns the team with less users
     * @returns the team with less users
     */
    public findDesirableTeamNum(): RoomTeamNum {
        let trNum: number = 0
        let ctNum: number = 0

        for (const userData of this.usersInfo.values()) {
            const team: RoomTeamNum = userData.team
            if (team === RoomTeamNum.Terrorist) {
                trNum++
            } else if (team === RoomTeamNum.CounterTerrorist) {
                ctNum++
            } else {
                console.warn('Room::findDesirableTeamNum: Unknown team number')
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
        return this.usersInfo.get(user).team
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
        for (const userData of this.usersInfo.values()) {
            const team: RoomTeamNum = userData.team
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
        for (const userData of this.usersInfo.values()) {
            const team: RoomTeamNum = userData.team
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
        return this.usersInfo.get(user).ready
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
        return this.usersInfo.get(user).ready === RoomReadyStatus.Yes
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
        this.usersInfo.get(user).team = newTeam
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

        const userInfo: RoomUser = this.usersInfo.get(user)
        const curStatus: RoomReadyStatus = userInfo.ready
        const newStatus: RoomReadyStatus =
            curStatus === RoomReadyStatus.No
                ? RoomReadyStatus.Yes : RoomReadyStatus.No
        userInfo.ready = newStatus
        return newStatus
    }

    /**
     * get's a room's status
     * @returns the room's status
     */
    public getStatus(): RoomStatus {
        return this.status
    }

    /**
     * set a room's status
     * @param newStatus the new room's status
     */
    public setStatus(newStatus: RoomStatus): void {
        this.status = newStatus
    }

    /**
     * is the countdown request user a host and can it start a global countdown?
     * @param user the user that requested the countdown
     */
    public canCountdown(user: User): boolean {
        return user === this.host && this.status === RoomStatus.Waiting
    }

    /**
     * progress through the 'game start' countdown
     * the room's host must send countdown requests in order to progress it
     * TODO: maybe do the countdown without depending on the room's host
     * @param hostNextNum the host's next countdown number
     */
    public progressCountdown(hostNextNum: number): void {
        if (this.countdown > defaultCountdownNum
            || this.countdown < 0) {
            console.warn('Room: the saved countdown is invalid!')
            this.countdown = 0
        }

        if (this.countingDown === false) {
            this.countingDown = true
        }

        if (this.countdown !== hostNextNum) {
            console.warn('Room: host\'s countdown does not match ours')
        }

        this.countdown--
    }

    /**
     * @returns the current room countdown number
     */
    public getCountdown(): number {
        if (this.countingDown === false) {
            console.warn('getCountdown: tried to get countdown without counting down'
                + 'this is most likely a bug')
            return 0
        }

        // make sure the countdown is inbounds
        if (this.countdown > defaultCountdownNum
            || this.countdown < 0) {
            console.warn(
                'getCountdown: our countdown is out of bounds. it\'s %i',
                this.countdown)
            this.countdown = 0
        }

        return this.countdown
    }

    /**
     * checks if a room's game countdown is in progress
     * @returns true if it's in progress, false if not
     */
    public isGlobalCountdownInProgress(): boolean {
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
                if (this.getNumOfReadyRealPlayers() < 2) {
                    return false
                }
                break
            case RoomGamemode.z_scenario_side:
            case RoomGamemode.endless_wave:
            case RoomGamemode.play_ground:
            case RoomGamemode.practice:
            default:
                break
        }

        return true
    }

    /**
     * loop through all the players
     * @param fn the func to call in each user
     */
    public recurseUsers(fn: (user: User) => void): void {
        for (const user of this.users) {
            fn(user)
        }
    }

    /**
     * loop through all the non host players
     * @param fn the func to call in each user
     */
    public recurseNonHostUsers(fn: (user: User) => void): void {
        for (const user of this.users) {
            if (user !== this.host) {
                fn(user)
            }
        }
    }

    /**
     * send the room's data to the user that joined the room
     * @param user the new user
     */
    public sendJoinNewRoom(user: User): void {
        const reply: Buffer = new OutRoomPacket(user.socket).createAndJoin(this)
        user.socket.send(reply)
    }

    /**
     * send to the user the room's settings
     * @param user the target user
     */
    public sendRoomSettingsTo(user: User): void {
        const newSettings: NewRoomSettings = NewRoomSettings.fromRoom(this)
        const reply: Buffer = new OutRoomPacket(user.socket).updateSettings(newSettings)
        user.socket.send(reply)
    }

    /**
     * send to the user updated room's settings
     * @param user the target user
     */
    public sendUpdateRoomSettingsTo(user: User, newSettings: NewRoomSettings): void {
        const reply: Buffer = new OutRoomPacket(user.socket).updateSettings(newSettings)
        user.socket.send(reply)
    }

    /**
     * send the room's data to the user that joined the room
     * @param user the player to send the other player's ready status
     * @param player the player whose ready status will be sent
     */
    public sendPlayerReadyStatusTo(user: User, player: User): void {
        const status: RoomReadyStatus = this.getUserReadyStatus(player)
        const reply: Buffer = new OutRoomPacket(user.socket).setUserReadyStatus(player, status)
        user.socket.send(reply)
    }

    /**
     * tell the user about a new user in the room
     * @param user the player to send the other player's ready status
     * @param newUser the player whose ready status will be sent
     */
    public sendNewUserTo(user: User, newUser: User): void {
        const team: RoomTeamNum = this.getUserTeam(newUser)
        const playerReply: Buffer = new OutRoomPacket(user.socket).playerJoin(newUser, team)
        user.socket.send(playerReply)
    }

    /**
     * tell the user about a new user in the room
     * @param user the player to send the other player's ready status
     * @param player the player whose ready status will be sent
     */
    public sendUserReadyStatusTo(user: User, player: User): void {
        const ready: RoomReadyStatus = this.getUserReadyStatus(player)
        const reply: Buffer = new OutRoomPacket(user.socket).setUserReadyStatus(player, ready)
        user.socket.send(reply)
    }

    /**
     * tell the user to connect to a host
     * @param user the user that will connect to the host
     * @param host the host to connect to
     */
    public sendConnectHostTo(user: User, host: User): void {
        const hostData: Buffer = new OutUdpPacket(1, host.userId,
            host.externalIpAddress, host.externalServerPort, user.socket).build()
        const guestJoinHost: Buffer = new OutHostPacket(user.socket).joinHost(host)
        user.socket.send(hostData)
        user.socket.send(guestJoinHost)
    }

    /**
     * send the host the guest that will connect to it
     * @param host the user hosting the match
     * @param guest the guest player joining the host's match
     */
    public sendGuestDataTo(host: User, guest: User): void {
        const guestData = new OutUdpPacket(0, guest.userId,
            guest.externalIpAddress, guest.externalClientPort, host.socket).build()
        host.socket.send(guestData)
    }

    /**
     * tell the host to start the game match
     * @param host the game match's host
     */
    public sendStartMatchTo(host: User): void {
        const start: Buffer = new OutHostPacket(host.socket).gameStart(host)
        host.socket.send(start)
    }

    /**
     * tell the user to close the game result window
     * @param user the target user
     */
    public sendCloseResultWindow(user: User): void {
        const reply: Buffer = new OutHostPacket(user.socket).leaveResultWindow()
        user.socket.send(reply)
    }

    /**
     * send a new player's team to an user
     * @param user the target user
     * @param player the user who changed its team
     */
    public sendTeamChangeTo(user: User, player: User, newTeamNum: RoomTeamNum): void {
        const reply: Buffer = new OutRoomPacket(user.socket).setUserTeam(player, newTeamNum)
        user.socket.send(reply)
    }

    /**
     * sends the global countdown number or stops it to the user
     * @param user the user to send the countdown to
     * @param shouldCountdown should the countdown continue
     */
    public sendCountdownTo(user: User, shouldCountdown: boolean): void {
        let reply: Buffer = null

        if (shouldCountdown) {
            reply = new OutRoomPacket(user.socket).progressCountdown(this.getCountdown())
        } else {
            reply = new OutRoomPacket(user.socket).stopCountdown()
        }

        user.socket.send(reply)
    }

    /**
     * ends a room's match and sends the players to the result window
     */
    public sendGameEnd(user: User): void {
        // TODO: set game end to ingame users only
        const stopReply: Buffer =
            new OutHostPacket(user.socket).hostStop()
        const resultReply: Buffer =
            new OutRoomPacket(user.socket).setGameResult()
        user.socket.send(stopReply)
        user.socket.send(resultReply)
    }

    /**
     * called when an user is succesfully removed
     * if the room is empty, inform the channel to delete us
     * else, find a new host
     * @param userId the user's id
     */
    private onUserRemoved(user: User): void {
        if (this.users.length !== 0) {
            this.sendRemovedUser(user)
            this.findAndUpdateNewHost()
        } else {
            this.emptyRoomCallback(this, this.parentChannel)
        }
    }

    /**
     * inform the users about an user being removed
     * @param userId the removed user's ID
     */
    private sendRemovedUser(deletedUser: User) {
        for (const user of this.users) {
            const reply: Buffer =
                new OutRoomPacket(user.socket).playerLeave(deletedUser.userId);
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
                new OutRoomPacket(user.socket).setHost(this.host)
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
