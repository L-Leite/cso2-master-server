import * as ip from 'ip'

import { InPacketBase } from './packet'

/**
 * incoming udp info packet (it's not an udp packet!)
 * Structure:
 * [base packet]
 * [unk00 - 1 byte]
 * [unk01 - 1 byte]
 * [ip - 4 bytes]
 * [port - 2 bytes]
 * [unk02 - 2 bytes]
 * @class InUdpPacket
 */
export class InUdpPacket extends InPacketBase {
    public unk00: number
    public unk01: number
    public ip: string
    public port: number
    public unk02: number // another port?

    /**
     * parses the packet's data
     */
    protected parse(): void {
        super.parse()

        this.unk00 = this.readUInt8()
        this.unk01 = this.readUInt8()

        if (this.packetData.byteLength === 6) {
            // implement this
            return
        }

        this.ip = ip.fromLong(this.readUInt32(true))
        this.port = this.readUInt16()
        this.unk02 = this.readUInt16()
    }
}
