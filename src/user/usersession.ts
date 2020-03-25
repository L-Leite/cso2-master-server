import LRU from 'lru-cache'
import superagent from 'superagent'

import { HolepunchType } from 'packets/holepunch/inholepunch'

import { SessionNetworkInfo } from 'user/sessionnetworkinfo'

import { userSvcAuthority, UserSvcPing } from 'authorities'

/**
 * holds an user's session information
 */
export class UserSession {
    /**
     * creates a new session
     * @param username the future session owner user's name
     * @param password the future session owner user's password
     * @returns the new session if successful, null if not
     */
    public static async create(username: string, password: string): Promise<UserSession> {
        try {
            const res: superagent.Response = await superagent
                .post(userSvcAuthority() + '/sessions')
                .send({
                    username,
                    password,
                })
                .accept('json')

            if (res.status === 201) {
                const session: UserSession = new UserSession()
                // HACK to get methods working
                Object.assign(session, res.body)
                sessionCache.set(session.userId, session)
                return session
            }

            return null
        } catch (error) {
            if (error.status === 409) {
                return null
            }
            UserSvcPing.checkNow()
            throw error
        }
    }

    /**
     * get a session's by its owning user's ID
     * @param userId the owner's user ID
     * @returns the session if successful, null if not
     */
    public static async get(userId: number): Promise<UserSession> {
        try {
            let session: UserSession = sessionCache.get(userId)

            if (session != null) {
                return session
            }

            const res: superagent.Response = await superagent
                .get(userSvcAuthority() + '/sessions/' + userId)
                .accept('json')

            if (res.status === 200) {
                session = new UserSession()
                // HACK to get methods working
                Object.assign(session, res.body)
                sessionCache.set(userId, session)
                return session
            }

            return null
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
            return null
        }
    }

    /**
     * delete a session's by its owning user's ID
     * @param userId the owner's user ID
     * @returns true if successful, null if not
     */
    public static async delete(userId: number): Promise<boolean> {
        try {
            const res: superagent.Response = await superagent
                .delete(userSvcAuthority() + '/sessions/' + userId)
                .accept('json')

            if (res.status === 200) {
                sessionCache.del(userId)
                return true
            }

            return false
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
            return false
        }
    }

    /**
     * delete a session's by its owning user's ID
     * @returns true if successful, null if not
     */
    public static async deleteAll(): Promise<boolean> {
        try {
            const res: superagent.Response = await superagent
                .delete(userSvcAuthority() + '/sessions')
                .accept('json')

            if (res.status === 200) {
                sessionCache.reset()
                return true
            }

            return false
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
            return false
        }
    }

    public userId: number

    public externalNet: SessionNetworkInfo
    public internalNet: SessionNetworkInfo

    public currentChannelServerIndex: number
    public currentChannelIndex: number
    public currentRoomId: number

    /**
     * updates this object to the database
     * @returns true if successful, false if not
     */
    public async update(): Promise<boolean> {
        try {
            const res: superagent.Response = await superagent
                .put(userSvcAuthority() + '/sessions/' + this.userId)
                .send(this)
                .accept('json')

            if (res.status === 200) {
                sessionCache.set(this.userId, this)
                return true
            }

            return false
        } catch (error) {
            console.error(error)
            UserSvcPing.checkNow()
            return false
        }
    }

    /**
     * is the user currently in a room?
     * @returns true if so, false if not
     */
    public isInRoom(): boolean {
        return this.currentRoomId !== 0
    }

    public setCurrentChannelIndex(channelServerIndex: number, channelIndex: number): void {
        this.currentChannelServerIndex = channelServerIndex
        this.currentChannelIndex = channelIndex
    }

    /**
     * checks if the holepunch's ipAddress and ports have been updated
     * @param ipAddress the user's IP address
     * @param portId the user's port ID
     * @param localPort the user's local port
     * @param externalPort the user's external port
     * @returns true if it should be updated, false if not
     */
    public shouldUpdatePorts(portId: number, localPort: number, externalPort: number): boolean {
        switch (portId) {
            case HolepunchType.Client:
                return localPort !== this.internalNet.clientPort
                    || externalPort !== this.externalNet.clientPort
            case HolepunchType.Server:
                return localPort !== this.internalNet.serverPort
                    || externalPort !== this.externalNet.serverPort
            case HolepunchType.SourceTV:
                return localPort !== this.internalNet.tvPort
                    || externalPort !== this.externalNet.tvPort
        }

        return false
    }

    public setHolepunch(portId: number, localPort: number,
                        externalPort: number): number {
        switch (portId) {
            case HolepunchType.Client:
                this.internalNet.clientPort = localPort
                this.externalNet.clientPort = externalPort
                return 0
            case HolepunchType.Server:
                this.internalNet.serverPort = localPort
                this.externalNet.serverPort = externalPort
                return 1
            case HolepunchType.SourceTV:
                this.internalNet.tvPort = localPort
                this.externalNet.tvPort = externalPort
                return 2
            default:
                return -1
        }
    }
}

const sessionCache = new LRU<number, UserSession>({ max: 100, maxAge: 1000 * 15 })
