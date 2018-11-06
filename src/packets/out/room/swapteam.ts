import { OutPacketBase } from 'packets/out/packet'

/**
 * Sub structure of Room packet
 * @class OutRoomSwapTeam
 */
export class OutRoomSwapTeam {
    private newTeam: number

    constructor(newTeam: number) {
        this.newTeam = newTeam
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt8(this.newTeam)
    }
}
