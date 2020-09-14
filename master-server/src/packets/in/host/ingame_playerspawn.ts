import { InPacketBase } from 'packets/in/packet'

import { Vector } from 'gametypes/vector'

/**
 * received when a player spawns
 */
export class InHostIngame_PlayerSpawn {
    public playerUserId: number
    public spawnPoint: Vector
    public isSpectating: boolean

    constructor(inPacket: InPacketBase) {
        this.playerUserId = inPacket.readUInt32()
        this.spawnPoint = new Vector(
            inPacket.readInt32(),
            inPacket.readInt32(),
            inPacket.readInt32()
        )
        this.isSpectating = inPacket.readUInt8() === 1
    }
}
