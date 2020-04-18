import { OutPacketBase } from 'packets/out/packet'

import { PacketLongString } from 'packets/packetlongstring'
import { PacketString } from 'packets/packetstring'

/**
 * contains a message destinated to an user's current room
 */
export class OutChatDefaultMsg {
    public static build(sender: string, teamNum: number, message: string, outPacket: OutPacketBase): void {
        const hasTeamNum: boolean = teamNum != null

        outPacket.writeString(new PacketString(sender))

        outPacket.writeUInt8(hasTeamNum === true ? 1 : 0)
        outPacket.writeUInt8(hasTeamNum === true ? teamNum : 0)

        outPacket.writeLongString(new PacketLongString(message))
    }
}
