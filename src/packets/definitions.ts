export const PacketSignature: number = 0x55 // 'U'

export enum PacketId {
    Version = 0,
    Reply,
    Lobby,
    Login,
    ServerList = 5,
    Character,
    Crypt,
    Room = 65,
    Host = 68,
    Udp = 70,
    Ban = 74,
    Automatch = 88,
    Achievement = 96,
    UserStart = 150,
    UserInfo = 157,
}

/*
packet structure:
{
    signature, (length: byte)
    sequence, (length: byte)
    data_size, (length: word)
    packet_id, (length: byte) this is part of data
    then the data itself (length: data_size)
}
*/
