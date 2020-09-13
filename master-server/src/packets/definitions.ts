// every tcp packet starts with this byte
export const PacketSignature = 0x55 // 'U'
// every udp packet starts with this byte
export const UdpPacketSignature = 0x57 // 'W'

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
    UserInfo = 157
}

export enum AboutmePacketType {
    CampaignUpdate = 4,
    SetSignature = 5,
    SetTitle = 6,
    SetAvatar = 7
}

export enum AchievementPacketType {
    Campaign = 3,
    Boss = 4
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
    DialogBoxExit = 60 // when client clicked 'OK', the game will exit (text start with '#CSO2_POPUP_')
}

export enum FavoritePacketType {
    SetLoadout = 0,
    SetCosmetics = 1
}

export enum HostPacketType {
    GameStart = 0, // when a host starts a new game
    HostJoin = 1, // when someone joins some host's game
    HostStop = 3,
    Ingame_PlayerDeath = 3,
    LeaveResultWindow = 4,
    Ingame_AddPoint = 7,
    Ingame_RoundEnd = 10,

    TeamChanging = 11, // when a user is changing his team in the game

    Ingame_BuyItem = 14,
    Ingame_PlayerSpawn = 20,

    // logging packet types
    OnGameEnd = 21,

    SetInventory = 101, // there are 2 or 3 other host packet types that send this
    ItemUsed = 105,
    SetLoadout = 107,
    SetBuyMenu = 111
}

export enum OptionPacketType {
    SetBuyMenu = 1
}

export enum MissionCampaignIds {
    Campaign_0 = 1,
    Campaign_1 = 8 << 0,
    Campaign_2 = 8 << 1,
    Campaign_3 = 8 << 2,
    Campaign_4 = 8 << 3,
    Campaign_5 = 8 << 4,
    Campaign_6 = 8 << 5 // unused
}

export function IsMissionCampaignIdValid(
    id: number | MissionCampaignIds
): boolean {
    return (
        id === MissionCampaignIds.Campaign_0 ||
        id === MissionCampaignIds.Campaign_1 ||
        id === MissionCampaignIds.Campaign_2 ||
        id === MissionCampaignIds.Campaign_3 ||
        id === MissionCampaignIds.Campaign_4 ||
        id === MissionCampaignIds.Campaign_5 ||
        id === MissionCampaignIds.Campaign_6
    )
}
export enum AboutmeCampaignUpdateType {
    Started = 0,
    Finished = 1
}
