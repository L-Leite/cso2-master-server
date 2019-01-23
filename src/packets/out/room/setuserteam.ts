import { OutPacketBase } from 'packets/out/packet'

import { User } from 'user/user'

/**
 * sends out a new user's team
 * it's capable of changing multiple users team at once,
 * but it's only changing one user at a time for now
 * @class OutRoomSetUserTeam
 */
export class OutRoomSetUserTeam {
    private usersTeam: Map<number, number>

    constructor(user: User, newTeam: number) {
        this.usersTeam = new Map<number, number>()
        this.usersTeam.set(user.userId, newTeam)
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt8(this.usersTeam.size)

        this.usersTeam.forEach((newTeam: number, actualUserId: number): void => {
            outPacket.writeUInt32(actualUserId)
            outPacket.writeUInt8(newTeam)
        })
    }
}
