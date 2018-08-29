import { Uint64LE } from 'int64-buffer';

export class UserData {
    public uuid: string
    public userName: string
    public level: number
    private curExp: Uint64LE
    private maxExp: Uint64LE
    private kills: number
    private deaths: number
    private assists: number

    constructor(uuid: string, userName: string) {
        this.uuid = uuid
        this.userName = userName
    }
}
