import { WritableStreamBuffer } from 'stream-buffers'

import { OutPacketBase } from 'packets/out/packet'

import { PacketId } from 'packets/definitions'
import { PacketString } from 'packets/packetstring'

import { ExtendedSocket } from 'extendedsocket'

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
    private userId: number
    private loginName: PacketString
    private userName: PacketString
    private unk00: number
    private holepunchPort: number
    constructor(userId: number, loginName: string, userName: string,
                holepunchPort: number, socket: ExtendedSocket) {
        super(socket, PacketId.UserStart)

        this.userId = userId
        this.loginName = new PacketString(loginName)
        this.userName = new PacketString(userName)
        this.unk00 = 1
        this.holepunchPort = holepunchPort
    }

    /**
     * builds the packet with data provided by us
     */
    public build(): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 20, incrementAmount: 4 })

        this.buildHeader()
        this.writeUInt32(this.userId)
        this.writeString(this.loginName)
        this.writeString(this.userName)
        this.writeUInt8(this.unk00)
        this.writeUInt16(this.holepunchPort)

        return this.getData()
    }
}
