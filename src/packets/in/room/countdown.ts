import { InPacketBase } from 'packets/in/packet'

export enum RoomCountdownType {
    InProgress = 0,
    Stop = 1,
}

/**
 * contains the countdown of a room, according to its host
 * @class InRoomCountdown
 */
export class InRoomCountdown {
    public type: RoomCountdownType
    public count: number

    constructor(inPacket: InPacketBase) {
        this.type = inPacket.readUInt8()

        if (this.type === RoomCountdownType.InProgress) {
            this.count = inPacket.readUInt8()
        }
    }

    /**
     * should we countdown?
     * @returns true if so, false if not
     */
    public shouldCountdown(): boolean {
        return this.type === RoomCountdownType.InProgress
    }
}
