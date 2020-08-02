import { InPacketBase } from 'packets/in/packet'

export enum InRoomType {
    NewRoomRequest = 0,
    JoinRoomRequest = 1,
    LeaveRoomRequest = 3,
    ToggleReadyRequest = 4,
    GameStartRequest = 5,
    UpdateSettings = 6,
    OnCloseResultWindow = 7,
    SetUserTeamRequest = 9,
    GameStartCountdownRequest = 19
}

/**
 * incoming room packet
 * @class InRoomPacket
 */
export class InRoomPacket extends InPacketBase {
    public packetType: InRoomType

    /**
     * parses the packet's data
     */
    protected parse(): void {
        super.parse()

        this.packetType = this.readUInt8()
    }
}
