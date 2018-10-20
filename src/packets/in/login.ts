import { Uint64LE } from 'int64-buffer'

import { InPacketBase } from 'packets/in/packet'

/**
 * incoming login packet
 * Structure:
 * [base packet]
 * [nexonUsername - the length of the str + 1 byte]
 * [gameUsername - the length of the str + 1 byte]
 * [unk00 - 1 byte]
 * [password - the length of the str + 2 bytes]
 * [hddHwid - 16 bytes]
 * [netCafeId - 4 bytes]
 * [unk01 - 4 bytes]
 * [userSn - 8 bytes]
 * [unk02 - the length of the str + 2 bytes]
 * [unk03 - 1 byte]
 * [isLeague - 1 byte]
 * [unk04 - 1 byte]
 * [unk05 - the length of the str + 1 byte]
 * [unk06 - the length of the str + 1 byte]
 * [unk07 - the length of the str + 1 byte]
 * @class InLoginPacket
 */
export class InLoginPacket extends InPacketBase {
    public nexonUsername: string
    public gameUsername: string
    public unk00: number
    public password: string
    public hddHwid: Buffer
    public netCafeId: string
    public unk01: number // packet related
    public userSn: Uint64LE
    public unk02: string
    public unk03: number
    public isLeague: number
    public unk04: number // always null
    public unk05: string // always null
    public unk06: string // always null
    public unk07: string

    /**
     * parses the packet's data
     */
    protected parse(): void {
        super.parse()
        this.nexonUsername = this.readString()
        this.gameUsername = this.readString()
        this.unk00 = this.readUInt8()
        this.password = this.readUtf8String()
        this.hddHwid = this.readArray(16)
        this.netCafeId = this.readUInt32(true).toString()
        this.unk01 = this.readUInt32()
        this.userSn = this.readUInt64()
        this.unk02 = this.readUtf8String()
        this.unk03 = this.readUInt8()
        this.isLeague = this.readUInt8()
        this.unk04 = this.readUInt8()
        this.unk05 = this.readString()
        this.unk06 = this.readString()
        this.unk07 = this.readString()
    }
}
