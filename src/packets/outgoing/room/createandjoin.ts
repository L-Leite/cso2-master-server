import { Uint64LE } from 'int64-buffer'
import { WritableStreamBuffer } from 'stream-buffers'

import { UserData } from '../../../userdata';
import { ValToBuffer } from '../../../util';
import { PacketString } from '../../packetstring';
import { OutgoingUserInfoPacket } from '../userinfo';

export class RoomCreateRoom {
    private roomHostId: number
    private unk01: number
    private unk02: number
    private roomId: number
    private unk04: number
    private roomFlags: Uint64LE
    // flags & 0x1
    private roomName: PacketString
    // end of flags & 0x1
    // flags & 0x2
    private unk05: number
    // end of flags & 0x2
    // flags & 0x4
    private unk06: number
    private unk07: number
    private unk08: number
    // end of flags & 0x4
    // flags & 0x8
    private unk09: PacketString
    // end of flags & 0x8
    // flags & 0x10
    private unk10: number
    // end of flags & 0x10
    // flags & 0x20
    private unk11: number
    // end of flags & 0x20
    // flags & 0x40
    private gameModeId: number
    // end of flags & 0x40
    // flags & 0x80
    private mapId: number
    private unk13: number
    // end of flags & 0x80
    // flags & 0x100
    private unk14: number
    // end of flags & 0x100
    // flags & 0x200
    private winLimit: number
    // end of flags & 0x200
    // flags & 0x400
    private killLimit: number
    // end of flags & 0x400
    // flags & 0x800
    private unk17: number
    // end of flags & 0x800
    // flags & 0x1000
    private unk18: number
    // end of flags & 0x1000
    // flags & 0x2000
    private unk19: number
    // end of flags & 0x2000
    // flags & 0x4000
    private unk20: number
    // end of flags & 0x4000
    // flags & 0x8000
    private unk21: number
    private unk22: number
    private unk23: number
    private unk24: number
    // end of flags & 0x8000
    // flags & 0x10000
    private unk25: number
    // end of flags & 0x10000
    // flags & 0x20000
    private unk26: number
    private unk27: number[]
    // end of flags & 0x20000
    // flags & 0x40000
    private unk28: number
    // end of flags & 0x40000
    // flags & 0x80000
    private unk29: number
    private unk30: number
    private unk31: number
    private unk32: number
    private unk33: number
    // end of flags & 0x80000
    // flags & 0x100000
    private unk34: number // if == 1, it can have 3 more bytes
    // end of flags & 0x100000
    // flags & 0x200000
    private unk35: number
    // end of flags & 0x200000
    // flags & 0x400000
    private unk36: number
    // end of flags & 0x400000
    // flags & 0x800000
    private unk37: number
    // end of flags & 0x800000
    // flags & 0x1000000
    private unk38: number
    // end of flags & 0x1000000
    // flags & 0x2000000
    private unk39: number
    // end of flags & 0x2000000
    // flags & 0x4000000
    private unk40: number
    // end of flags & 0x4000000
    // flags & 0x8000000
    private unk41: number
    // end of flags & 0x8000000
    // flags & 0x10000000
    private unk42: number
    // end of flags & 0x10000000
    // flags & 0x20000000
    private unk43: number
    // end of flags & 0x20000000
    // flags & 0x40000000
    private unk44: number
    // end of flags & 0x40000000
    // flags & 0x80000000
    private unk45: number
    // end of flags & 0x80000000
    // flags & 0x100000000
    private unk46: number
    // end of flags & 0x100000000
    private numOfPlayers: number
    private playerIds: number[]
    private playerUnk00: number[]
    private playerUnk01: number[]
    private playerUnk02: number[]
    private playerIpAddress: number[]
    private playerPort: number[]
    private playerUnk05: number[]
    private playerUnk06: number[]
    private playerUnk07: number[]
    private playerUnk08: number[]
    private playerUnk09: number[]
    private playerUnk10: number[]
    private players: UserData[]

    constructor(roomId: number, roomName: string, hostId: number,
                gameModeId: number, mapId: number, winLimit: number, killLimit: number,
                players: UserData[]) {

        this.roomHostId = 1
        this.unk01 = 2
        this.unk02 = 2
        this.roomId = 0x219
        this.unk04 = 5
        this.roomFlags = new Uint64LE(-1)
        this.roomName = new PacketString('??!????????!')
        this.unk05 = 0
        this.unk06 = 0
        this.unk07 = 0
        this.unk08 = 0
        this.unk09 = new PacketString(null)
        this.unk10 = 0
        this.unk11 = 1
        this.gameModeId = 0x2F
        this.mapId = 3
        this.unk13 = 0
        this.unk14 = 1
        this.winLimit = 0xA
        this.killLimit = 0xA
        this.unk17 = 1
        this.unk18 = 0xA
        this.unk19 = 0
        this.unk20 = 0
        this.unk21 = 0
        this.unk22 = 0
        this.unk23 = 0
        this.unk24 = 0
        this.unk25 = 0x5A
        this.unk26 = 0
        /*for (let i = 0; i < this.unk26; i++) {
            add to this.unk27
        }*/
        this.unk28 = 1
        this.unk29 = 0
        this.unk30 = 0
        this.unk31 = 1
        this.unk32 = 1
        this.unk33 = 0
        this.unk34 = 0
        this.unk35 = 0
        this.unk36 = 0
        this.unk37 = 0
        this.unk38 = 0
        this.unk39 = 1
        this.unk40 = 0
        this.unk41 = 0x3E80
        this.unk42 = 0
        this.unk43 = 0
        this.unk44 = 0
        this.unk45 = 0
        this.unk46 = 3

        this.numOfPlayers = players.length
        this.playerIds = []
        this.playerUnk00 = []
        this.playerUnk01 = []
        this.playerUnk02 = []
        this.playerIpAddress = []
        this.playerPort = []
        this.playerUnk05 = []
        this.playerUnk06 = []
        this.playerUnk07 = []
        this.playerUnk08 = []
        this.playerUnk09 = []
        this.playerUnk10 = []
        players.forEach((element) => {
            this.playerIds.push(element.userId)
            this.playerUnk00.push(2)
            this.playerUnk01.push(0)
            this.playerUnk02.push(0)
            // this.playerIpAddress.push(0x1FB153BC)
            // this.playerPort.push(0xC2A2)
            this.playerIpAddress.push(0x4501A8C0)
            this.playerPort.push(0x6987)
            this.playerUnk05.push(0xE87C)
            this.playerUnk06.push(0xD4F2)
            this.playerUnk07.push(0x138A8C0)
            this.playerUnk08.push(0x6987)
            this.playerUnk09.push(0x697D)
            this.playerUnk10.push(0x698C)
        });
        this.players = players
    }
    public build(outStream: WritableStreamBuffer): void {
        outStream.write(ValToBuffer(this.roomHostId, 4))

        outStream.write(ValToBuffer(this.unk01, 1))
        outStream.write(ValToBuffer(this.unk02, 1))

        outStream.write(ValToBuffer(this.roomId, 2))

        outStream.write(ValToBuffer(this.unk04, 1))

        // special class start?
        outStream.write(ValToBuffer(this.roomFlags, 8))
        outStream.write(this.roomName.toBuffer())

        outStream.write(ValToBuffer(this.unk05, 1))

        outStream.write(ValToBuffer(this.unk06, 1))
        outStream.write(ValToBuffer(this.unk07, 4))
        outStream.write(ValToBuffer(this.unk08, 4))

        outStream.write(this.unk09.toBuffer())

        outStream.write(ValToBuffer(this.unk10, 2))

        outStream.write(ValToBuffer(this.unk11, 1))

        outStream.write(ValToBuffer(this.gameModeId, 1))

        outStream.write(ValToBuffer(this.mapId, 1))
        outStream.write(ValToBuffer(this.unk13, 1))

        outStream.write(ValToBuffer(this.unk14, 1))
        outStream.write(ValToBuffer(this.winLimit, 1))

        outStream.write(ValToBuffer(this.killLimit, 2))

        outStream.write(ValToBuffer(this.unk17, 1))

        outStream.write(ValToBuffer(this.unk18, 1))

        outStream.write(ValToBuffer(this.unk19, 1))

        outStream.write(ValToBuffer(this.unk20, 1))

        outStream.write(ValToBuffer(this.unk21, 1))
        outStream.write(ValToBuffer(this.unk22, 1))
        outStream.write(ValToBuffer(this.unk23, 1))
        outStream.write(ValToBuffer(this.unk24, 1))

        outStream.write(ValToBuffer(this.unk25, 1))

        outStream.write(ValToBuffer(this.unk26, 1))
        if (this.unk27 != null) {
            for (const elem of this.unk27) {
                outStream.write(ValToBuffer(elem, 1))
            }
        }

        outStream.write(ValToBuffer(this.unk28, 1))

        outStream.write(ValToBuffer(this.unk29, 1))
        outStream.write(ValToBuffer(this.unk30, 1))
        outStream.write(ValToBuffer(this.unk31, 1))
        outStream.write(ValToBuffer(this.unk32, 1))
        outStream.write(ValToBuffer(this.unk33, 1))

        // if == 1, it can have 3 more bytes
        outStream.write(ValToBuffer(this.unk34, 1))

        outStream.write(ValToBuffer(this.unk35, 1))

        outStream.write(ValToBuffer(this.unk36, 1))

        outStream.write(ValToBuffer(this.unk37, 1))

        outStream.write(ValToBuffer(this.unk38, 1))

        outStream.write(ValToBuffer(this.unk39, 1))

        outStream.write(ValToBuffer(this.unk40, 1))

        outStream.write(ValToBuffer(this.unk41, 2))

        outStream.write(ValToBuffer(this.unk42, 1))

        outStream.write(ValToBuffer(this.unk43, 1))

        outStream.write(ValToBuffer(this.unk44, 1))

        outStream.write(ValToBuffer(this.unk45, 1))

        outStream.write(ValToBuffer(this.unk46, 1))
        // special class end?

        // special class start?
        outStream.write(ValToBuffer(this.numOfPlayers, 1))

        let curPlayer = 0
        this.playerIds.forEach((element) => {
            outStream.write(ValToBuffer(element, 4))

            outStream.write(ValToBuffer(this.playerUnk00[curPlayer], 1))

            outStream.write(ValToBuffer(this.playerUnk01[curPlayer], 1))

            outStream.write(ValToBuffer(this.playerUnk02[curPlayer], 1))

            outStream.write(ValToBuffer(this.playerIpAddress[curPlayer], 4))

            outStream.write(ValToBuffer(this.playerPort[curPlayer], 2))

            outStream.write(ValToBuffer(this.playerUnk05[curPlayer], 2))

            outStream.write(ValToBuffer(this.playerUnk06[curPlayer], 2))

            outStream.write(ValToBuffer(this.playerUnk07[curPlayer], 4))

            outStream.write(ValToBuffer(this.playerUnk08[curPlayer], 2))

            outStream.write(ValToBuffer(this.playerUnk09[curPlayer], 2))

            outStream.write(ValToBuffer(this.playerUnk10[curPlayer], 2))

            const player = this.players[curPlayer]
            const userInfo = new OutgoingUserInfoPacket(player.userId, player.userName,
                player.level, player.curExp, player.maxExp, player.wins,
                player.kills, player.deaths, player.assists, 0)
            userInfo.buildData(outStream)

            curPlayer++
        })
        // special class end?
    }
}
