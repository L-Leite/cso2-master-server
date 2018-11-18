import * as ip from 'ip'

import { InPacketBase } from 'packets/in/packet'

enum InUdpPacketType {
    Heartbeat = 0,
    Data = 2,
}

/**
 * incoming udp info packet (it's not an udp packet!)
 * @class InUdpPacket
 */
export class InUdpPacket extends InPacketBase {
    public type: number
    public unk01: number
    public ip: string
    public port: number
    public unk02: number // another port?

    /**
     * is this an UDP heartbeat?
     */
    public isHeartbeat(): boolean {
        return this.type === InUdpPacketType.Heartbeat
    }

    /**
     * parses the packet's data
     */
    protected parse(): void {
        super.parse()

        this.type = this.readUInt8()

        // the heartbeat packet doesn't have any more data
        if (this.isHeartbeat()) {
            return
        }

        this.unk01 = this.readUInt8()

        this.ip = ip.fromLong(this.readUInt32(true))
        this.port = this.readUInt16()
        this.unk02 = this.readUInt16()
    }
}
