// every tcp packet starts with this byte
export const PacketSignature: number = 0x55 // 'U'

export enum PacketId {
    Version = 0,
    Reply,
    Login = 3,
    ServerList = 5,
    Character,
    Crypt,
    RequestChannels = 10,
    Room = 65,
    Host = 68,
    Udp = 70,
    Ban = 74,
    QuickStart = 86,
    Automatch = 88,
    GZ = 95,
    Achievement = 96,
    ConfigInfo = 106,
    Lobby = 107,
    UserStart = 150,
    RoomList = 151,
    UserInfo = 157,
}
