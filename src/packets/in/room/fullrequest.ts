import { InPacketBase } from 'packets/in/packet'

/**
 * incoming user request to create a new room
 * @class InRoomNewRequest
 */
export class InRoomNewRequest {
    public roomName: string
    public unk00: number
    public unk01: number
    public gameModeId: number
    public mapId: number
    public winLimit: number
    public killLimit: number
    public unk02: number
    public unk03: number
    public unk04: number
    public roomPassword: string
    public unk06: number
    public unk07: number
    public unk08: number
    public unk09: number
    public unk10: number
    public unk11: number

    constructor(inPacket: InPacketBase) {
        this.roomName = inPacket.readString()
        this.unk00 = inPacket.readUInt16()
        this.unk01 = inPacket.readUInt8()
        this.gameModeId = inPacket.readUInt8()
        this.mapId = inPacket.readUInt8()
        this.winLimit = inPacket.readUInt8()
        this.killLimit = inPacket.readUInt16()
        this.unk02 = inPacket.readUInt8()
        this.unk03 = inPacket.readUInt8()
        this.unk04 = inPacket.readUInt8()
        this.roomPassword = inPacket.readString()
        this.unk06 = inPacket.readUInt8()
        this.unk07 = inPacket.readUInt8()
        this.unk08 = inPacket.readUInt8()
        this.unk09 = inPacket.readUInt8()
        this.unk10 = inPacket.readUInt8()
        this.unk11 = inPacket.readUInt32()
    }
}
