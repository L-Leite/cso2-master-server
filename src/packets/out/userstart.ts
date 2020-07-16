import { WritableStreamBuffer } from 'stream-buffers'

import { OutPacketBase } from 'packets/out/packet'

import { PacketId } from 'packets/definitions'

/**
 * sends out the result of a login attempt
 * Structure:
 * [base packet]
 * [userId - 4 bytes]
 * [loginName - the length of the str + 1 byte]
 * [userName - the length of the str + 1 byte]
 * [unk00 - 1 byte]
 * [serverUdpPort - 2 bytes]
 * @class OutUserStartPacket
 */
export class OutUserStartPacket extends OutPacketBase {
    constructor(
        userId: number,
        loginName: string,
        userName: string,
        holepunchPort: number
    ) {
        super(PacketId.UserStart)

        this.outStream = new WritableStreamBuffer({
            initialSize: 20,
            incrementAmount: 4
        })

        this.buildHeader()
        this.writeUInt32(userId)
        this.writeString(loginName)
        this.writeString(userName)
        this.writeUInt8(1) // unk00
        this.writeUInt16(holepunchPort)
    }
}
