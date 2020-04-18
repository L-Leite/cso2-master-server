import { Channel } from 'channel/channel'

import { ExtendedSocket } from 'extendedsocket'

import { ChannelManager } from 'channel/channelmanager'
import { RoomSettings } from 'room/roomsettings'
import { RoomUserEntry } from 'room/roomuserentry'

import { InRoomUpdateSettings } from 'packets/in/room/updatesettings'
import { OutHostPacket } from 'packets/out/host'
import { OutRoomPacket } from 'packets/out/room'
import { OutUdpPacket } from 'packets/out/udp'
import { UserSession } from 'user/usersession'

import { ActiveConnections } from 'storage/activeconnections'

export enum RoomTeamNum {
    Unknown = 0,
    Terrorist = 1,
    CounterTerrorist = 2,
}

export enum RoomReadyStatus {
    NotReady = 0,
    Ingame = 1,
    Ready = 2,
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
    enableBots?: boolean,
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
    /**
     * tell the user to close the game result window
     * @param conn the user's connection
     */
    public static sendCloseResultWindow(conn: ExtendedSocket): void {
        conn.send(OutHostPacket.leaveResultWindow())
    }

    /**
     * remove an user from its current room
     * if the user isn't in a room then it won't do anything
     * @param user the target user
     * @returns true if successful or if not in a room, false if not
     */
    public static cleanUpUser(conn: ExtendedSocket): boolean {
        const session: UserSession = conn.getSession()

        const room: Room = session.currentRoom

        if (room == null) {
            return false
        }

        room.removeUser(session.user.userId)

        session.currentRoom = null

        return true
    }

    public id: number
    public settings: RoomSettings

    public host: RoomUserEntry
    public usersInfo: RoomUserEntry[]

    private emptyRoomCallback: (emptyRoom: Room, channel: Channel) => void
    private parentChannel: Channel

    private countingDown: boolean
    private countdown: number

    constructor(roomId: number, hostUserId: number, hostConn: ExtendedSocket, parentChannel: Channel,
                emptyRoomCallback?: (emptyRoom: Room, channel: Channel) => void,
                options?: IRoomOptions) {
        this.id = roomId

        this.usersInfo = []

        this.parentChannel = parentChannel
        this.emptyRoomCallback = emptyRoomCallback

        this.settings = new RoomSettings(options)

        this.countingDown = false
        this.countdown = defaultCountdownNum

        this.host = this.addUser(hostUserId, hostConn)
    }

    /**
     * gives the ammount of player slots available in the room
     * @returns the free player slots
     */
    public getFreeSlots(): number {
        const availableSlots: number = this.settings.maxPlayers - this.usersInfo.length
        return Math.max(0, availableSlots)
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
     * @param userId the user ID to find
     * @returns true the user is found, false if not
     */
    public hasUser(userId: number): boolean {
        return this.getRoomUser(userId) != null
    }

    /**
     * add an user to a room
     * @param userId the target user's ID
     * @returns the created user's room data
     */
    public addUser(userId: number, connection: ExtendedSocket): RoomUserEntry {
        const userData: RoomUserEntry = new RoomUserEntry(userId, connection,
            this.findDesirableTeamNum(), RoomReadyStatus.NotReady)
        this.usersInfo.push(userData)
        return userData
    }

    /**
     * remove an user from a room
     * @param userId the user to be removed ID
     */
    public removeUser(userId: number): void {
        for (const info of this.usersInfo) {
            if (info.userId === userId) {
                this.usersInfo.splice(this.usersInfo.indexOf(info), 1)
                this.onUserRemoved(info.userId)
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

        //
        // send new players to the host's team, if bot mode is enabled
        //
        if (this.settings.areBotsEnabled) {
            // make sure there is at least one human player
            if (trNum + ctNum > 0) {
                const hostTeamNum: RoomTeamNum = this.host.team
                return hostTeamNum
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
     * @param userId the target user's ID
     */
    public getUserTeam(userId: number): RoomTeamNum {
        const info: RoomUserEntry = this.getRoomUser(userId)

        if (info == null) {
            console.warn('getUserTeam: userId %i not found', userId)
            return RoomTeamNum.Unknown
        }

        return info.team
    }

    /**
     * gives the number of playersthat are ready
     * @returns the num of players ready
     */
    public getNumOfReadyRealPlayers(): number {
        let numReadyPlayers: number = 0
        for (const info of this.usersInfo) {
            if (info.isReady() === true
                || info === this.host) {
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

        if (this.settings.teamBalanceType === RoomTeamBalance.WithBots) {
            const numCts: number = this.getNumOfRealCts()
            const numTer: number = this.getNumOfRealTerrorists()

            const requiredBalanceBots: number = Math.abs(numCts - numTer)
            botPlayers = Math.max(botPlayers, requiredBalanceBots)
        }

        return this.getNumOfReadyRealPlayers() + botPlayers
    }

    /**
     * get's an user's room information through its ID
     * @param userId the target user's ID
     * @returns the user's room info if found, else it returns null
     */
    public getRoomUser(userId: number): RoomUserEntry {
        return this.usersInfo.find((u: RoomUserEntry) => u.userId === userId)
    }

    /**
     * returns an user's ready status
     * @param userId the target user's ID
     */
    public getUserReadyStatus(user: RoomUserEntry): RoomReadyStatus {
        return user.ready
    }

    /**
     * checks if an user is ready
     * @param userId the target user's ID
     * @returns true if an user is ready, false if not
     */
    public isUserReady(userId: number): boolean {
        const userInfo: RoomUserEntry = this.getRoomUser(userId)

        if (userInfo == null) {
            console.warn('isUserReady: couldnt get user\'s room data (userId: %i)', userId)
            return false
        }

        return userInfo.ready === RoomReadyStatus.Ready
    }

    /**
     * is the user ingame?
     * @param userId the target user's ID
     * @returns true if it is, false if not
     */
    public isUserIngame(userId: number): boolean {
        const user: RoomUserEntry = this.getRoomUser(userId)

        if (user == null) {
            return false
        }

        return user.isIngame
    }

    /**
     * checks if the room's users are ready
     * @returns true if everyone is ready, false if not
     */
    public isRoomReady(): boolean {
        for (const info of this.usersInfo) {
            if (info.isReady() === false) {
                return false
            }
        }
        return true
    }

    /**
     * set's an user's current team number and sends it to everyone in the room
     * @param user the target user's ID
     * @param newTeam the user's new team
     */
    public updateUserTeam(userId: number, newTeam: RoomTeamNum): void {
        const user: RoomUserEntry = this.getRoomUser(userId)
        user.team = newTeam

        // inform every user in the room of the changes
        this.broadcastNewUserTeamNum(userId, newTeam)
    }

    /**
     * set's an user's ingame status
     * @param user the target user
     * @param ingame the new ingame status
     */
    public setUserIngame(user: RoomUserEntry, ingame: boolean): void {
        user.isIngame = ingame
        user.ready = ingame ? RoomReadyStatus.Ingame : RoomReadyStatus.NotReady
    }

    /**
     * toggles the user's room ready status
     * @param userId the target user's ID
     * @param newStatus the user's new ready status
     * @returns the new ready state
     */
    public toggleUserReadyStatus(userId: number): RoomReadyStatus {
        if (userId === this.host.userId) {
            console.warn('toggleUserReadyStatus: host tried to toggle ready')
            return null
        }

        const userInfo: RoomUserEntry = this.getRoomUser(userId)

        if (userInfo == null) {
            console.warn('toggleUserReadyStatus: couldnt get userinfo')
            return null
        }

        const curStatus: RoomReadyStatus = userInfo.ready
        const newStatus: RoomReadyStatus =
            curStatus === RoomReadyStatus.NotReady
                ? RoomReadyStatus.Ready : RoomReadyStatus.NotReady
        userInfo.ready = newStatus
        return newStatus
    }

    /**
     * resets the ready status of ingame users
     * @returns true if reset successfully, false if not
     */
    public resetIngameUsersReadyStatus(): boolean {
        for (const user of this.usersInfo) {
            if (user == null) {
                console.warn('resetIngameUsersReadyStatus: couldnt get userinfo')
                return false
            }

            user.ready = RoomReadyStatus.NotReady
        }

        return true
    }

    /**
     * get's a room's status
     * @returns the room's status
     */
    public getStatus(): RoomStatus {
        return this.settings.status
    }

    /**
     * set a room's status
     * @param newStatus the new room's status
     */
    public setStatus(newStatus: RoomStatus): void {
        this.settings.status = newStatus
        this.settings.isIngame = newStatus === RoomStatus.Ingame
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

        this.countdown--

        if (this.countdown !== hostNextNum) {
            console.warn('Room: host\'s countdown does not match ours. ours %i host %i', this.countdown, hostNextNum)
        }
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
     * ends a match and sends players to the match results screen
     */
    public endGame(): void {
        this.setStatus(RoomStatus.Waiting)
        this.resetIngameUsersReadyStatus()

        this.recurseUsers((u: RoomUserEntry): void => {
            this.sendRoomStatusTo(u)
            this.sendRoomUsersReadyStatusTo(u)
            if (this.isUserIngame(u.userId) === true) {
                this.sendGameEnd(u)
                this.setUserIngame(u, false)
            }
        })

        this.sendBroadcastReadyStatus()
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
            case RoomGamemode.casualbomb:
            case RoomGamemode.casualoriginal:
            case RoomGamemode.eventmod01:
            case RoomGamemode.eventmod02:
            case RoomGamemode.diy:
            case RoomGamemode.campaign1:
            case RoomGamemode.campaign2:
            case RoomGamemode.campaign3:
            case RoomGamemode.campaign4:
            case RoomGamemode.campaign5:
            case RoomGamemode.tdm_small:
            case RoomGamemode.de_small:
            case RoomGamemode.madcity:
            case RoomGamemode.madcity_team:
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
            case RoomGamemode.hide_match:
            case RoomGamemode.hide_origin:
            case RoomGamemode.hide_Item:
            case RoomGamemode.hide_multi:
            case RoomGamemode.ghost:
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
        }

        return true
    }

    /**
     * loop through all the players
     * @param fn the func to call in each user
     */
    public recurseUsers(fn: (u: RoomUserEntry) => void): void {
        for (const user of this.usersInfo) {
            fn(user)
        }
    }

    /**
     * loop through all the non host players
     * @param fn the func to call in each user
     */
    public recurseNonHostUsers(fn: (u: RoomUserEntry) => void): void {
        for (const user of this.usersInfo) {
            if (user !== this.host) {
                fn(user)
            }
        }
    }

    /**
     * send the room's data to the user that joined the room
     * @param userId the new user's ID
     */
    public sendJoinNewRoom(userId: number): void {
        const user: RoomUserEntry = this.getRoomUser(userId)
        user.conn.send(OutRoomPacket.createAndJoin(this))
    }

    /**
     * update room's settings and broadcast them to everyone in it
     * @param newSettings the requested new room's settings
     */
    public updateSettings(newSettings: InRoomUpdateSettings): void {
        if (newSettings.roomName != null) {
            this.settings.roomName = newSettings.roomName
        }
        if (newSettings.gameModeId != null) {
            this.settings.gameModeId = newSettings.gameModeId
        }
        if (newSettings.mapId != null) {
            this.settings.mapId = newSettings.mapId
        }
        if (newSettings.killLimit != null) {
            this.settings.killLimit = newSettings.killLimit
        }
        if (newSettings.winLimit != null) {
            this.settings.winLimit = newSettings.winLimit
        }
        if (newSettings.startMoney != null) {
            this.settings.startMoney = newSettings.startMoney
        }
        if (newSettings.maxPlayers != null) {
            this.updateMaxPlayers(newSettings.maxPlayers)
        }
        if (newSettings.respawnTime != null) {
            this.settings.respawnTime = newSettings.respawnTime
        }
        if (newSettings.changeTeams != null) {
            this.settings.changeTeams = newSettings.changeTeams
        }
        if (newSettings.forceCamera != null) {
            this.settings.forceCamera = newSettings.forceCamera
        }
        if (newSettings.teamBalanceType != null) {
            this.settings.teamBalanceType = newSettings.teamBalanceType
        }
        if (newSettings.weaponRestrictions != null) {
            this.settings.weaponRestrictions = newSettings.weaponRestrictions
        }
        if (newSettings.hltvEnabled != null) {
            this.settings.hltvEnabled = newSettings.hltvEnabled
        }
        if (newSettings.mapCycleType != null) {
            this.settings.mapCycleType = newSettings.mapCycleType
        }
        if (newSettings.multiMaps != null) {
            this.settings.multiMaps = newSettings.multiMaps
        }
        // which flag enabled this?
        /*if (newSettings.nextMapEnabled != null) {
            this.settings.nextMapEnabled = newSettings.nextMapEnabled
        }*/
        if (newSettings.botEnabled != null) {
            this.updateBotEnabled(newSettings.botEnabled, newSettings.botDifficulty,
                newSettings.numCtBots, newSettings.numTrBots)
        }

        if (newSettings.unk00 != null) {
            this.settings.unk00 = newSettings.unk00
        }
        if (newSettings.unk01 != null) {
            this.settings.unk01 = newSettings.unk01
        }
        if (newSettings.unk02 != null) {
            this.settings.unk02 = newSettings.unk02
        }
        if (newSettings.unk03 != null) {
            this.settings.unk03 = newSettings.unk03
        }
        if (newSettings.unk09 != null) {
            this.settings.unk09 = newSettings.unk09
        }
        if (newSettings.unk10 != null) {
            this.settings.unk10 = newSettings.unk10
        }
        if (newSettings.unk13 != null) {
            this.settings.unk13 = newSettings.unk13
        }
        if (newSettings.unk17 != null) {
            this.settings.unk17 = newSettings.unk17
        }
        if (newSettings.unk18 != null) {
            this.settings.unk18 = newSettings.unk18
        }
        if (newSettings.status != null) {
            this.settings.status = newSettings.status
        }
        if (newSettings.unk21 != null) {
            this.settings.unk21 = newSettings.unk21
        }
        if (newSettings.unk23 != null) {
            this.settings.unk23 = newSettings.unk23
        }
        if (newSettings.unk24 != null) {
            this.settings.unk24 = newSettings.unk24
        }
        if (newSettings.unk25 != null) {
            this.settings.unk25 = newSettings.unk25
        }
        if (newSettings.unk29 != null) {
            this.settings.unk29 = newSettings.unk29
        }
        if (newSettings.unk30 != null) {
            this.settings.unk30 = newSettings.unk30
        }
        if (newSettings.unk31 != null) {
            this.settings.unk31 = newSettings.unk31
        }
        if (newSettings.unk32 != null) {
            this.settings.unk32 = newSettings.unk32
        }
        if (newSettings.unk33 != null) {
            this.settings.unk33 = newSettings.unk33
        }
        if (newSettings.unk35 != null) {
            this.settings.unk35 = newSettings.unk35
        }
        if (newSettings.unk36 != null) {
            this.settings.unk36 = newSettings.unk36
        }
        if (newSettings.unk37 != null) {
            this.settings.unk37 = newSettings.unk37
        }
        if (newSettings.unk38 != null) {
            this.settings.unk38 = newSettings.unk38
        }
        if (newSettings.unk39 != null) {
            this.settings.unk39 = newSettings.unk39
        }
        if (newSettings.isIngame != null) {
            this.settings.isIngame = newSettings.isIngame
        }
        if (newSettings.unk43 != null) {
            this.settings.unk43 = newSettings.unk43
        }
        if (newSettings.difficulty != null) {
            this.settings.difficulty = newSettings.difficulty
        }

        // inform every user in the room of the changes
        this.broadcastNewRoomSettings()
    }

    /**
     * send to the user the room's settings
     * @param user the target user
     */
    public sendRoomSettingsTo(userId: number): void {
        const user: RoomUserEntry = this.getRoomUser(userId)
        user.conn.send(OutRoomPacket.updateSettings(this.settings))
    }

    public sendUpdateRoomSettingsTo(user: RoomUserEntry, updatedSettings: RoomSettings): void {
        user.conn.send(OutRoomPacket.updateSettings(updatedSettings))
    }

    /**
     * tell the user about a new user in the room
     * @param user the player to send the other player's ready status
     * @param newUser the player whose ready status will be sent
     */
    public sendNewUserTo(user: RoomUserEntry, newUser: RoomUserEntry): void {
        const team: RoomTeamNum = newUser.team

        if (team == null) {
            console.warn('sendNewUserTo: couldnt get user team (userId: %i room "%s" room id %i)',
                user.userId, this.settings.roomName, this.id)
            return null
        }

        user.conn.send(OutRoomPacket.playerJoin(newUser.conn.getSession().user, team))
    }

    /**
     * send a new player's ready status to everyone
     * also sends everyone's ready status to the new player
     * @param userId the new player's user ID
     */
    public updateNewPlayerReadyStatus(userId: number): void {
        const target: RoomUserEntry = this.getRoomUser(userId)
        this.recurseUsers((u: RoomUserEntry): void => {
            // send everyone's status to the new user
            this.sendUserReadyStatusTo(target, u)

            if (u !== target) {
                // tell other room members about the new addition
                this.sendNewUserTo(u, target)
                this.sendUserReadyStatusTo(u, target)
            }
        })
    }

    public hostGameStart(): void {
        this.stopCountdown()
        this.setStatus(RoomStatus.Ingame)
        this.setUserIngame(this.host, true)

        this.recurseNonHostUsers((u: RoomUserEntry): void => {
            this.sendRoomStatusTo(u)
            if (u.isReady()) {
                this.setUserIngame(u, true)
                this.sendConnectHostTo(u, this.host)
                this.sendGuestDataTo(this.host, u)
            }
        })

        this.sendBroadcastReadyStatus()

        this.sendStartMatchTo(this.host)
    }

    public async guestGameJoin(guestUserId: number): Promise<void> {
        const guest: RoomUserEntry = this.getRoomUser(guestUserId)

        this.sendRoomStatusTo(guest)
        this.setUserIngame(guest, true)

        this.sendConnectHostTo(guest, this.host)
        this.sendGuestDataTo(this.host, guest)

        this.sendBroadcastReadyStatus()
    }

    /**
     * send an user's updated ready status to everyone else
     * @param sourceUserId the user ID of the player who updated their ready status
     */
    public broadcastNewUserReadyStatus(sourceUserId: number): void {
        const sourceUser: RoomUserEntry = this.getRoomUser(sourceUserId)
        this.recurseUsers((u: RoomUserEntry): void => {
            this.sendUserReadyStatusTo(u, sourceUser)
        })
    }

    /**
     * sends updated room settings to everyone in it
     */
    public broadcastNewRoomSettings(): void {
        this.recurseUsers((u: RoomUserEntry): void => {
            this.sendUpdateRoomSettingsTo(u, this.settings)
        })
    }

    /**
     * sends everyone a new user's team number
     * @param sourceUserId the user whose team number changed
     * @param newTeamNum the new team number
     */
    public broadcastNewUserTeamNum(sourceUserId: number, newTeamNum: RoomTeamNum): void {
        const sourceUser: RoomUserEntry = this.getRoomUser(sourceUserId)
        this.recurseUsers((u: RoomUserEntry): void => {
            this.sendTeamChangeTo(u, sourceUser, newTeamNum)

            if (this.settings.areBotsEnabled) {
                u.team = newTeamNum
                this.sendTeamChangeGlobal(u, newTeamNum)
            }
        })
    }

    /**
     * sends everyone in the room the room's countdown
     * @param shouldCountdown should the countdown continue?
     */
    public broadcastCountdown(shouldCountdown: boolean): void {
        this.recurseUsers((u: RoomUserEntry): void => {
            this.sendCountdownTo(u, shouldCountdown)
        })
    }

    /**
     * send an user's ready status to another user
     * @param user the player to send the other player's ready status
     * @param player the player whose ready status will be sent
     */
    public sendUserReadyStatusTo(user: RoomUserEntry, player: RoomUserEntry): void {
        const ready: RoomReadyStatus = player.ready

        if (ready == null) {
            console.warn('sendUserReadyStatusTo: couldnt get user status (userId: %i room "%s" room id %i)',
                user.userId, this.settings.roomName, this.id)
            return null
        }

        user.conn.send(OutRoomPacket.setUserReadyStatus(player.userId, ready))
    }

    /**
     * send everyone's ready status to an user
     * @param targetUser the user to send the info to
     */
    public sendRoomUsersReadyStatusTo(targetUser: RoomUserEntry): void {
        this.recurseUsers((u: RoomUserEntry): void => {
            this.sendUserReadyStatusTo(targetUser, u)
        })
    }

    /**
     * send everyone everyone's ready status
     */
    public sendBroadcastReadyStatus(): void {
        this.recurseUsers((u: RoomUserEntry): void => {
            this.sendRoomUsersReadyStatusTo(u)
        })
    }

    /**
     * tell the user to connect to a host
     * @param user the user that will connect to the host
     * @param host the host to connect to
     */
    public sendConnectHostTo(user: RoomUserEntry, host: RoomUserEntry): void {
        const hostConn = ActiveConnections.Singleton().FindByOwnerId(host.userId)
        const hostSession: UserSession = hostConn.getSession()

        if (hostSession == null) {
            return
        }

        user.conn.send(new OutUdpPacket(true, host.userId,
            hostSession.externalNet.ipAddress, hostSession.externalNet.serverPort))
        user.conn.send(OutHostPacket.joinHost(host.userId))
    }

    /**
     * send the host the guest that will connect to it
     * @param host the user hosting the match
     * @param guest the guest player joining the host's match
     */
    public sendGuestDataTo(host: RoomUserEntry, guest: RoomUserEntry): void {
        const guestConn = ActiveConnections.Singleton().FindByOwnerId(guest.userId)
        const guestSession: UserSession = guestConn.getSession()

        if (guestSession == null) {
            return
        }

        host.conn.send(new OutUdpPacket(false, guest.userId,
            guestSession.externalNet.ipAddress, guestSession.externalNet.clientPort))
    }

    /**
     * tell the host to start the game match
     * @param host the game match's host
     */
    public sendStartMatchTo(host: RoomUserEntry): void {
        host.conn.send(OutHostPacket.gameStart(host.userId))
    }

    /**
     * send a new player's team to an user
     * @param user the target user
     * @param player the user who changed its team
     * @param newTeamNum the player's new team number
     */
    public sendTeamChangeTo(user: RoomUserEntry, player: RoomUserEntry, newTeamNum: RoomTeamNum): void {
        user.conn.send(OutRoomPacket.setUserTeam(player.userId, newTeamNum))
    }

    /**
     * send a new player's team to everyone in the room
     * @param player the user who changed its team
     * @param newTeamNum the player's new team number
     */
    public sendTeamChangeGlobal(player: RoomUserEntry, newTeamNum: RoomTeamNum): void {
        this.recurseUsers((u: RoomUserEntry) => {
            this.sendTeamChangeTo(u, player, newTeamNum)
        })
    }

    /**
     * sends the global countdown number or stops it to the user
     * @param user the user to send the countdown to
     * @param shouldCountdown should the countdown continue
     */
    public sendCountdownTo(user: RoomUserEntry, shouldCountdown: boolean): void {
        user.conn.send(shouldCountdown
            ? OutRoomPacket.progressCountdown(this.getCountdown())
            : OutRoomPacket.stopCountdown())
    }

    /**
     * ends a room's match and sends the players to the result window
     */
    public sendGameEnd(user: RoomUserEntry): void {
        // TODO: set game end to ingame users only
        user.conn.send(OutHostPacket.hostStop())
        user.conn.send(OutRoomPacket.setGameResult())
    }

    /**
     * send an user its current room's status
     * @param user the target user
     */
    public sendRoomStatusTo(user: RoomUserEntry): void {
        const settings: RoomSettings = new RoomSettings()
        settings.status = this.settings.status
        settings.isIngame = this.settings.isIngame

        user.conn.send(OutRoomPacket.updateSettings(settings))
    }

    /**
     * handle max players setting's update event
     * @param newMaxPlayers the requested new max players number
     */
    private updateMaxPlayers(newMaxPlayers: number): void {
        // reset bot number to 4 for each team when max players is changed
        // and the old max players value is bigger than the new one
        // this stops overflowing the max player number (where bots are included)
        if (this.settings.maxPlayers > newMaxPlayers) {
            if (this.settings.areBotsEnabled) {
                this.settings.numCtBots = this.settings.numTrBots = 4
            }
        }

        this.settings.maxPlayers = newMaxPlayers
    }

    /**
     * handle bot enabled setting's update event
     * @param newMaxPlayers should enable the bots?
     */
    private updateBotEnabled(botEnabled: number, botDifficulty: number,
                             ctBots: number, terBots: number): void {
        this.settings.areBotsEnabled = !!botEnabled

        if (this.settings.areBotsEnabled) {
            this.settings.botDifficulty = botDifficulty
            this.settings.numCtBots = ctBots
            this.settings.numTrBots = terBots

            //
            // set everyone to the host's team if bot mode is enabled
            //
            const hostTeamNum: RoomTeamNum = this.host.team

            this.recurseNonHostUsers((u: RoomUserEntry): void => {
                const curUserTeamNum: RoomTeamNum = this.getUserTeam(u.userId)

                if (curUserTeamNum !== hostTeamNum) {
                    u.team = hostTeamNum

                    // tell everyone the new user's team
                    this.sendTeamChangeGlobal(u, hostTeamNum)
                }
            })
        } else {
            this.settings.botDifficulty = 0
            this.settings.numCtBots = 0
            this.settings.numTrBots = 0
        }
    }

    /**
     * called when an user is succesfully removed
     * if the room is empty, inform the channel to delete us
     * else, find a new host
     * @param userId the target user's id
     */
    private onUserRemoved(userId: number): void {
        if (this.usersInfo.length !== 0) {
            this.sendRemovedUser(userId)

            // if the host leaves, assign someone else as the new host
            if (userId === this.host.userId) {
                this.findAndUpdateNewHost()
            }
        } else {
            this.emptyRoomCallback(this, this.parentChannel)
        }
    }

    /**
     * inform the users about an user being removed
     * @param deletedUserId the removed user's ID
     */
    private sendRemovedUser(deletedUserId: number) {
        for (const info of this.usersInfo) {
            info.conn.send(OutRoomPacket.playerLeave(deletedUserId))
        }
    }

    /**
     * sets the new room host and tells the users about it
     * @param newHost the new host user
     */
    private updateHost(newHost: RoomUserEntry): void {
        this.host = newHost

        for (const user of this.usersInfo) {
            user.conn.send(OutRoomPacket.setHost(this.host.userId))
        }
    }

    /**
     * assign the first available user as a host,
     * and updates the users about it
     * only if the room isn't empty
     * @returns true if a new host was found, false if not
     */
    private findAndUpdateNewHost(): boolean {
        if (this.usersInfo.length === 0) {
            return false
        }

        this.updateHost(this.usersInfo[0])
        return true
    }
}
