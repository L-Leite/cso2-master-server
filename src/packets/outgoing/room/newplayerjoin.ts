import { Uint64LE } from 'int64-buffer'
import { WritableStreamBuffer } from 'stream-buffers'

import { UserData } from '../../../userdata';
import { ValToBuffer } from '../../../util';
import { PacketString } from '../../packetstring';
import { OutgoingUserInfoPacket } from '../userinfo';

export class RoomNewPlayerJoin {
    private userId: number
    private playerUnk00: number
    private playerUnk01: number
    private playerUnk02: number
    private playerUnk03: number
    private playerUnk04: number
    private playerUnk05: number
    private playerUnk06: number
    private playerUnk07: number
    private playerUnk08: number
    private playerUnk09: number
    private playerUnk10: number
    private player: UserData

    constructor(user: UserData) {

        this.userId = user.userId
        this.playerUnk00 = 2
        this.playerUnk01 = 0
        this.playerUnk02 = 0
        this.playerUnk03 = 0x1FB153BC
        this.playerUnk04 = 0xC2A2
        this.playerUnk05 = 0xE87C
        this.playerUnk06 = 0xD4F2
        this.playerUnk07 = 0x138A8C0
        this.playerUnk08 = 0x6987
        this.playerUnk09 = 0x697D
        this.playerUnk10 = 0x698C
        this.player = user
    }
    public build(outStream: WritableStreamBuffer): void {
        outStream.write(ValToBuffer(this.userId, 4))

        outStream.write(ValToBuffer(this.playerUnk00, 1))

        outStream.write(ValToBuffer(this.playerUnk01, 1))

        outStream.write(ValToBuffer(this.playerUnk02, 1))

        outStream.write(ValToBuffer(this.playerUnk03, 4))

        outStream.write(ValToBuffer(this.playerUnk04, 2))

        outStream.write(ValToBuffer(this.playerUnk05, 2))

        outStream.write(ValToBuffer(this.playerUnk06, 2))

        outStream.write(ValToBuffer(this.playerUnk07, 4))

        outStream.write(ValToBuffer(this.playerUnk08, 2))

        outStream.write(ValToBuffer(this.playerUnk09, 2))

        outStream.write(ValToBuffer(this.playerUnk10, 2))

        const player = this.player
        const userInfo = new OutgoingUserInfoPacket(player.userId, player.userName,
            player.level, player.curExp, player.maxExp, player.wins,
            player.kills, player.deaths, player.assists, 0)
        userInfo.buildData(outStream)
    }
}
