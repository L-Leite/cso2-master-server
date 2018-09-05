import * as ip from 'ip'
import * as net from 'net'

import { IncomingPacket } from './packet'

function numberToIpString(ipNum: number) {
    const d = ipNum % 256;
    let res: string = null
    for (let i = 3; i > 0; i--) {
        ipNum = Math.floor(ipNum / 256);
        res = ipNum % 256 + '.' + res;
    }
    return res;
}

export class IncomingUdpPacket extends IncomingPacket {
    public unk00: number
    public unk01: number
    public ip: string
    public port: number
    public unk02: number // another port?

    // returns parsed size of packet
    protected parse(): number {
        let curOffset = super.parse()

        this.unk00 = this.packetData[curOffset++]
        this.unk01 = this.packetData[curOffset++]

        this.ip = ip.fromLong(this.packetData.readUInt32LE(curOffset))
        curOffset += 4

        this.port = this.packetData.readUInt16LE(curOffset)
        curOffset += 2

        this.unk02 = this.packetData.readUInt16LE(curOffset)
        curOffset += 2

        return curOffset
    }
}
