import { OutPacketBase } from 'packets/out/packet'

/**
 * preloads an user's inventory by using its entity number
 * @class OutHostPreloadInventory
 */
export class OutHostPreloadInventory {
    private entityNum: number

    // writes somewhere to CGameClient
    private unk00: number

    // these are unconfirmed
    private numOfWeapons: number
    private weaponId: number[]
    private weaponSkinId: number[]

    constructor(entityNum: number) {
        this.entityNum = entityNum
        this.unk00 = 0

        this.weaponId = []
        this.weaponSkinId = []
        this.numOfWeapons = this.weaponId.length
    }

    public build(outPacket: OutPacketBase): void {
        outPacket.writeUInt32(this.entityNum)
        outPacket.writeUInt8(this.unk00)

        outPacket.writeUInt16(this.numOfWeapons)

        for (let i: number = 0; i < this.numOfWeapons; i++) {
            const wepId: number = this.weaponId[i]
            const skinId: number = this.weaponSkinId[i]

            outPacket.writeUInt32(wepId)
            outPacket.writeUInt16(skinId)
        }
    }
}
