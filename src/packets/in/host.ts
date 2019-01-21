import { InPacketBase } from 'packets/in/packet'

import { InHostPreloadInventory } from 'packets/in/host/preloadinventory'

export enum HostPacketType {
    GameStart = 0, // when a host starts a new game
    HostJoin = 1, // when someone joins some host's game
    HostStop = 3,
    LeaveResultWindow = 4,

    // logging packet types
    OnGameEnd = 21,

    PreloadInventory = 101, // there are 2 or 3 other host packet types that send this
}
/**
 * incoming host packet
 * @class InHostPacket
 */
export class InHostPacket extends InPacketBase {
    public packetType: HostPacketType

    public preloadInventory: InHostPreloadInventory

    public isPreloadInventory(): boolean {
        return this.packetType === HostPacketType.PreloadInventory
    }

    public hasGameEnded(): boolean {
        return this.packetType === HostPacketType.OnGameEnd
    }

    /**
     * parses the packet's data
     */
    protected parse(): void {
        super.parse()

        this.packetType = this.readUInt8()

        switch (this.packetType) {
            case HostPacketType.PreloadInventory:
                this.preloadInventory = new InHostPreloadInventory(this)
                break

            case HostPacketType.OnGameEnd:
                break

            default:
                console.warn('InHostPacket::parse: unknown packet type %i', this.packetType)
                break
        }
    }
}
