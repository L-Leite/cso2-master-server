import net from 'net'

import { HolepunchType } from 'packets/holepunch/inholepunch'

import { SessionNetworkInfo } from 'user/sessionnetworkinfo'
import { User } from 'user/user'

/**
 * holds an user's session information
 */
export class UserSession {
    public user: User

    public externalNet: SessionNetworkInfo
    public internalNet: SessionNetworkInfo

    public currentChannelServerIndex: number
    public currentChannelIndex: number
    public currentRoomId: number

    constructor(user: User, addr: net.AddressInfo) {
        this.externalNet = new SessionNetworkInfo()
        this.internalNet = new SessionNetworkInfo()
        this.user = user
        this.externalNet.ipAddress = addr.address

        this.currentChannelServerIndex = 0
        this.currentChannelIndex = 0
        this.currentRoomId = 0
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
