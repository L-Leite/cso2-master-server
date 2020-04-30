// every tcp packet starts with this byte
export const PacketSignature: number = 0x55 // 'U'

export enum PacketId {
    Version = 0,
    Reply = 1,
    Login = 3,
    ServerList = 5,
    Character = 6,
    RequestRoomList = 7,
    RequestChannels = 10,
    Room = 65,
    Chat = 67,
    Host = 68,
    AboutMe = 69,
    Udp = 70,
    Ban = 74,
    Option = 76,
    Favorite = 77,
    QuickStart = 86,
    Automatch = 88,
    Friend = 89,
    Unlock = 90,
    GZ = 95,
    Achievement = 96,
    ConfigInfo = 106,
    Lobby = 107,
    UserStart = 150,
    RoomList = 151,
    Inventory_Add = 152,
    Inventory_Create = 154,
    UserInfo = 157,
}

export enum ChatMessageType {
    DirectMessage = 0, // also known as whisper
    Channel = 1,
    Room = 2,
    IngameGlobal = 3,
    IngameTeam = 4,
    Clan = 5,
    Party = 7,
    IngameParty = 9,

    // only for the server, not sended by any player
    Congratulate = 11, // when someone get the rare item from box opening
    SystemImportant = 20,
    DialogBox = 21, // note: has not 'Yes' and 'No' select option
    System = 22,
}
