import { Uint64LE } from 'int64-buffer'

import { OutPacketBase } from 'packets/out/packet'

/**
 * sends only an user's changed data
 */
export class UserInfoDynamicUpdate {
    /**
     * builds an update campaign packet to send to the user
     * @param newFlags the new user campaign flags
     * @param outPacket the packet where the data will go
     */
    public static buildCampaign(
        newFlags: number,
        outPacket: OutPacketBase
    ): void {
        outPacket.writeUInt32(0x1000)

        outPacket.writeUInt8(0) // unk43
        outPacket.writeUInt16(newFlags)
        outPacket.writeUInt32(0) // unk45
    }

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

    /**
     * builds an update game stats packet to send to the user
     * @param played_matches the new user's matches played amount
     * @param wins the new user's wins amount
     * @param kills the new user's kills amount
     * @param headshots the new user's headshots amount
     * @param deaths the new user's deaths amount
     * @param assists the new user's assists amount
     * @param accuracy the new user's accuracy amount
     * @param seconds_played the new user's number of seconds spent playing
     * @param outPacket the packet where the data will go
     */
    public static buildGameStats(
        played_matches: number,
        wins: number,
        kills: number,
        headshots: number,
        deaths: number,
        assists: number,
        accuracy: number,
        seconds_played: number,
        outPacket: OutPacketBase
    ): void {
        outPacket.writeUInt32(0x40)

        outPacket.writeUInt32(played_matches) // played game
        outPacket.writeUInt32(wins) // wins (win rate = wins / played game)
        outPacket.writeUInt32(kills) // kills
        outPacket.writeUInt32(headshots) // headshots (hs rate = hs / kills)
        outPacket.writeUInt32(deaths) // deaths
        outPacket.writeUInt32(assists) // assists
        outPacket.writeUInt16(accuracy) // hit rate
        outPacket.writeUInt32(seconds_played) // played time (s)
    }
}
