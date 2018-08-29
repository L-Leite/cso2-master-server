import { UserData } from './userdata'

export class UserStorage {
    private data: Map<string, UserData>
    private dataCount: number

    constructor() {
        this.data = new Map<string, UserData>()
        this.dataCount = 0
    }

    public getUser(uuid: string): UserData {
        return this.data.get(uuid)
    }

    public addUser(uuid: string, userName: string): void {
        const newData: UserData = new UserData(uuid, userName)
        this.data.set(uuid, newData)
        this.dataCount++
    }

    public removeUser(uuid: string): void {
        this.data.delete(uuid)
        this.dataCount--
    }
}
