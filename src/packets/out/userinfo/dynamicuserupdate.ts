import { OutPacketBase } from 'packets/out/packet'

/**
 * sends only an user's changed data
 */
export class UserInfoDynamicUpdate {
    /**
     * builds an update avatar packet to send to the user
     * @param newAvatar the new user avatar's ID
     * @param outPacket the packet where the data will go
     */
    public static buildAvatar(
        newAvatar: number,
        outPacket: OutPacketBase
    ): void {
        outPacket.writeUInt32(0x800000)
        outPacket.writeUInt16(newAvatar)
    }

    /**
     * builds an update avatar packet to send to the user
     * @param newAvatar the new user avatar's ID
     * @param outPacket the packet where the data will go
     */
    public static buildSignature(
        newSignature: string,
        outPacket: OutPacketBase
    ): void {
        outPacket.writeUInt32(0x40000)
        outPacket.writeString(newSignature)
    }

    /**
     * builds an update avatar packet to send to the user
     * @param newAvatar the new user avatar's ID
     * @param outPacket the packet where the data will go
     */
    public static buildTitle(newTitle: number, outPacket: OutPacketBase): void {
        outPacket.writeUInt32(0x8000)
        outPacket.writeUInt16(newTitle)
    }
}
