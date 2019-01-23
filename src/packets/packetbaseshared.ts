import { PacketId, PacketSignature } from 'packets/definitions'

/**
 * The shared packet's header
 * Structure:
 * [signature - 1 byte]
 * [sequence - 1 byte]
 * [length - 2 bytes]
 * [packetId - 1 byte] - this is technically not part
 *                 of the base packet
 * @class OutPacketBase
 */
export class PacketBaseShared {
    // does not count packetId
    public static headerLength: number = 4

    public signature: number
    public sequence: number
    public length: number
    public id: PacketId

    /**
     * is the packet signature good?
     * @returns true if yes, otherwise false
     */
    public isValid(): boolean {
        return this.signature === PacketSignature
    }

}
