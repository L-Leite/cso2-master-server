export enum HostPacketType {
    GameStart = 0, // when a host starts a new game
    HostJoin = 1, // when someone joins some host's game
    HostStop = 3,
    LeaveResultWindow = 4,

    TeamChanging = 11, // when a user is changing his team in the game

    // logging packet types
    OnGameEnd = 21,

    SetInventory = 101, // there are 2 or 3 other host packet types that send this
    SetLoadout = 107,
    SetBuyMenu = 111,
}
