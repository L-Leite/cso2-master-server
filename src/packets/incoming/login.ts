import { Uint64LE } from 'int64-buffer'
import { PacketString } from '../packetstring'
import { PacketUtf8String } from '../packetutf8string'
import { IncomingPacket } from './packet'

export class IncomingLoginPacket extends IncomingPacket {
    public nexonUsername: string
    public gameUsername: string
    public unk00: number
    public password: string
    public hddHwid: Uint8Array
    public netCafeId: string
    public unk01: number // packet related
    public userSn: Uint64LE
    public unk02: string
    public unk03: number
    public isLeague: boolean
    public unk04: number // always null
    public unk05: string // always null
    public unk06: string // always null
    public unk07: string

    protected parse(): number {
        let curOffset = super.parse()

        this.nexonUsername = PacketString.from(
            this.packetData.slice(curOffset,
                this.packetData.length)).str
        curOffset += 1 + this.packetData[curOffset]

        this.gameUsername = PacketString.from(
            this.packetData.slice(curOffset,
                this.packetData.length)).str
        curOffset += 1 + this.packetData[curOffset]

        this.unk00 = this.packetData[curOffset++]

        this.password = PacketUtf8String.from(
            this.packetData.slice(curOffset,
                this.packetData.length)).str
        curOffset += 2 + this.packetData[curOffset]

        this.hddHwid = this.packetData.slice(curOffset, curOffset + 16)
        curOffset += 16

        this.netCafeId = this.packetData.readUInt32BE(curOffset).toString()
        curOffset += 4

        this.unk01 = this.packetData.readUInt32LE(curOffset)
        curOffset += 4

        this.userSn = new Uint64LE(this.packetData.slice(curOffset, curOffset + 8))
        curOffset += 8

        this.unk02 = PacketUtf8String.from(
            this.packetData.slice(curOffset,
                this.packetData.length)).str
        curOffset += 2 + this.packetData[curOffset]

        this.unk03 = this.packetData[curOffset++]
        this.isLeague = this.packetData[curOffset++] as any as boolean // ugly
        this.unk04 = this.packetData[curOffset++]

        this.unk05 = PacketString.from(
            this.packetData.slice(curOffset,
                this.packetData.length)).str
        curOffset += 1 + this.packetData[curOffset]

        this.unk06 = PacketString.from(
            this.packetData.slice(curOffset,
                this.packetData.length)).str
        curOffset += 1 + this.packetData[curOffset]

        this.unk07 = PacketString.from(
            this.packetData.slice(curOffset,
                this.packetData.length)).str
        curOffset += 1 + this.packetData[curOffset]

        return curOffset
    }
}
