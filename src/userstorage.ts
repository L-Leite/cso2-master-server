import * as ip from 'ip'

import { ExtendedSocket } from './extendedsocket'
import { UserData } from './userdata'

/**
 * stores the logged in users
 */
export class UserStorage {
    public static getUser(userId: number): UserData {
        return this.data.get(userId)
    }

    public static getUserByUuid(uuid: string): UserData {
        for (const entry of this.data) {
            if (entry['1'].uuid === uuid) {
                return entry['1']
            }
        }
        return null
    }

    public static addUser(socket: ExtendedSocket, userId: number, userName: string): UserData {
        const newData: UserData = new UserData(socket.uuid, userId, userName)
        let ipAddress: string = socket.remoteAddress
        if (ip.isV6Format(ipAddress)) {
            if (ipAddress.substr(0, 7) === '::ffff:') {
                ipAddress = ipAddress.substr(7, ipAddress.length - 7)
            }
        }
        newData.externalIpAddress = ipAddress
        this.data.set(userId, newData)
        this.dataCount++
        return newData
    }

    public static removeUser(userId: number): void {
        this.data.delete(userId)
        this.dataCount--
    }

    public static removeUserByUuid(uuid: string): void {
        for (const entry of this.data) {
            if (entry['1'].uuid === uuid) {
                this.data.delete(entry['1'].userId)
                this.dataCount--
                return
            }
        }
    }

    private static data: Map<number, UserData> = new Map<number, UserData>()
    private static dataCount: number = 0
}
