import { OutPacketBase } from 'packets/out/packet'

/**
 * sends out a new user's team
 * it's capable of changing multiple users team at once,
 * but it's only changing one user at a time for now
 * @class OutRoomSetUserTeam
 */
export class OutRoomSetUserTeam {
    public static build(userIds: number[], newTeams: number[], outPacket: OutPacketBase): void {
        if (userIds.length !== newTeams.length) {
            throw new Error('The size of userIds and newTeams array must be the same!')
        }

        const usersTeam: Map<number, number> = new Map<number, number>()

        for (let i = 0; i < userIds.length; i++) {
            usersTeam.set(userIds[i], newTeams[i])
        }

        outPacket.writeUInt8(usersTeam.size)

        usersTeam.forEach((newTeam: number, actualUserId: number): void => {
            outPacket.writeUInt32(actualUserId)
            outPacket.writeUInt8(newTeam)
        })
    }
}
