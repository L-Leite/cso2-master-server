import { InPacketBase } from 'packets/in/packet'

/**
 * requests an user's team change
 * @class InHostTeamChanging
 */

export class InHostTeamChanging extends InPacketBase {
    public type: number
    public userId: number
    public unk00: number
    public unk01: number
    public newTeam: number

    /**
     * parses the packet's data
     */
    protected parse(): void {
        super.parse()
        this.type = this.readUInt8()
        this.userId = this.readUInt16()
        this.unk00 = this.readUInt8()
        this.unk01 = this.readUInt8()
        this.newTeam = this.readUInt8()
    }
}
