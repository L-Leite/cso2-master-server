import { ExtendedSocket } from './extendedsocket'
import { UserData } from './userdata'

/**
 * stores an array of user's info
 */
export class UserStorage {
    public static getUser(userId: number): UserData {
        return this.data.get(userId)
    }

    public static getUserByUuid(uuid: string): UserData {
        this.data.forEach((value: UserData, key: number) => {
            if (value.uuid === uuid) {
                return value
            }
        })
        return null
    }

    public static addUser(socket: ExtendedSocket, userId: number, userName: string): UserData {
        const newData: UserData = new UserData(socket.uuid, socket.remoteAddress, userId, userName)
        this.data.set(userId, newData)
        return newData
    }

    public static removeUser(userId: number): void {
        this.data.delete(userId)
    }

    public static removeUserByUuid(uuid: string): void {
        this.data.forEach((value: UserData, key: number) => {
            if (value.uuid === uuid) {
                this.data.delete(key)
                return
            }
        })
    }

    private static data: Map<number, UserData> = new Map<number, UserData>()
}
