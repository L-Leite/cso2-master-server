import { RoomData } from './roomdata'

/**
 * stores the available rooms tores the logged in users
 */
export class RoomStorage {
    public static getRoom(roomId: number): RoomData {
        return this.data.get(roomId)
    }

    public static addRoom(roomId: number, roomName: string, hostId: number,
                          gameModeId: number, mapId: number,
                          winLimit: number, killLimit: number): RoomData {
        const newData: RoomData = new RoomData(roomId, roomName,
            hostId, gameModeId, mapId, winLimit, killLimit)
        this.data.set(roomId, newData)
        this.dataCount++
        return newData
    }

    public static removeUser(roomId: number): void {
        this.data.delete(roomId)
        this.dataCount--
    }

    private static data: Map<number, RoomData> = new Map<number, RoomData>()
    private static dataCount: number = 0
}
