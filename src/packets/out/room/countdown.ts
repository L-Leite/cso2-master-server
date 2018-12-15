import { OutPacketBase } from 'packets/out/packet'

import { RoomCountdownType } from 'packets/in/room/countdown'

/**
 * Sub structure of Room packet
 * @class OutRoomCountdown
 */
export class OutRoomCountdown {
    private type: RoomCountdownType
    private count: number

    constructor(shouldCooldown: boolean, countdown?: number) {
        this.type = shouldCooldown
            ? RoomCountdownType.InProgress
            : RoomCountdownType.Stop
        this.count = countdown
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt8(this.type)

        if (this.type === RoomCountdownType.InProgress) {
            outPacket.writeUInt8(this.count)
        }
    }
}
