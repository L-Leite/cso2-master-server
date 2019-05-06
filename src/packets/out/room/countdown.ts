import { OutPacketBase } from 'packets/out/packet'

import { RoomCountdownType } from 'packets/in/room/countdown'

/**
 * sends the current countdown status to the user
 * @class OutRoomCountdown
 */
export class OutRoomCountdown {
    public static build(shouldCooldown: boolean, countdown: number, outPacket: OutPacketBase): void {
        const type = shouldCooldown
            ? RoomCountdownType.InProgress
            : RoomCountdownType.Stop
        outPacket.writeUInt8(type)

        if (type === RoomCountdownType.InProgress) {
            outPacket.writeUInt8(countdown)
        }
    }
}
