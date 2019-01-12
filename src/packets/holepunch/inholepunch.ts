import ip from 'ip'

export const UdpPacketSignature: number = 0x57 // 'W'

export enum HolepunchType {
    Client = 0,
    Server = 256,
    SourceTV = 512,
}

export class InHolepunchPacketUdp {
    public userId: number
    public portId: number
    public ipAddress: string
    public port: number
    protected packetData: Buffer
    private signature: number

    constructor(data: Buffer) {
        this.packetData = data
        this.parse()
    }

    // returns parsed size of packet
    protected parse(): number {
        let curOffset = 0

        this.signature = this.packetData.readUInt8(curOffset++)

        if (this.signature !== UdpPacketSignature) {
            throw new Error('this is not a holepucnh packet!')
        }

        if (this.packetData.byteLength === 6) {
            // this.userId = this.packetData.readUInt32LE(curOffset)
            // curOffset += 4

            // keep alive packet
        } else {
            this.userId = this.packetData.readUInt32LE(curOffset)
            curOffset += 4

            this.portId = this.packetData.readUInt16LE(curOffset)
            curOffset += 2

            // cso2 does a bitwise not operation on the ip. maybe find out why?
            /* tslint:disable-next-line:no-bitwise */
            const fixedIp: number = ~this.packetData.readUInt32BE(curOffset)
            this.ipAddress = ip.fromLong(fixedIp)
            curOffset += 4

            this.port = this.packetData.readUInt16LE(curOffset)
            curOffset += 2
        }

        return curOffset
    }
}
