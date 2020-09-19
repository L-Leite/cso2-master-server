import { InPacketBase } from 'packets/in/packet'

import { Vector } from 'gametypes/vector'
import { CSO2TakeDamageInfo } from 'gametypes/cso2takedamageinfo'

/**
 * received when an user scores a point in a game match
 */
export class InHostIngame_PlayerDeath {
    public damageInfo: CSO2TakeDamageInfo

    constructor(inPacket: InPacketBase) {
        this.damageInfo = {
            killFlags: inPacket.readUInt32(),
            attacker: {
                userId: inPacket.readUInt32(),
                weaponId: inPacket.readUInt32(),
                teamNum: inPacket.readUInt8(),
                clientType: inPacket.readUInt8(),
                characterType: inPacket.readUInt8(),
                characterClass: inPacket.readUInt32()
            },
            someVictimSpecialFlags: inPacket.readUInt32(),
            victim: {
                userId: inPacket.readUInt32(),
                weaponId: inPacket.readUInt32(),
                teamNum: inPacket.readUInt8(),
                clientType: inPacket.readUInt8(),
                characterType: inPacket.readUInt8(),
                characterClass: inPacket.readUInt32()
            },
            attackerPos: new Vector(
                inPacket.readInt32(),
                inPacket.readInt32(),
                inPacket.readInt32()
            ),
            victimPos: new Vector(
                inPacket.readInt32(),
                inPacket.readInt32(),
                inPacket.readInt32()
            ),
            unk01: [],
            unk02: [],
            unk03: [],
            unk04: []
        }

        const unkArrayCount = inPacket.readUInt16()

        for (let i = 0; i < unkArrayCount; i++) {
            this.damageInfo.unk01.push(inPacket.readUInt8())
            this.damageInfo.unk02.push(inPacket.readUInt32())
            this.damageInfo.unk03.push(inPacket.readUInt32())
            this.damageInfo.unk04.push(inPacket.readUInt8())
        }
    }
}
