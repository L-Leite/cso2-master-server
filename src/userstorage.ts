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

    public static addUser(uuid: string, userId: number, userName: string): UserData {
        const newData: UserData = new UserData(uuid, userId, userName)
        this.data.set(userId, newData)
        this.dataCount++
        return newData
    }

    public static removeUser(userId: number): void {
        this.data.delete(userId)
        this.dataCount--
    }

    private static data: Map<number, UserData> = new Map<number, UserData>()
    private static dataCount: number = 0
}
