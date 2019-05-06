import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'
import { RoomListCollection } from 'packets/out/roomlist/collection'

import { Room } from 'room/room'

enum OutRoomListType {
    SendFullRoomList = 0,
}

/**
 * outgoing room host information
 * @class OutHostPacket
 */
export class OutRoomListPacket extends OutPacketBase {
    public static async getFullList(rooms: Room[]): Promise<OutRoomListPacket> {
        const packet: OutRoomListPacket = new OutRoomListPacket()

        packet.outStream = new WritableStreamBuffer(
            { initialSize: 100, incrementAmount: 20 })

        packet.buildHeader()
        packet.writeUInt8(OutRoomListType.SendFullRoomList)

        await new RoomListCollection(rooms).build(packet)

        return packet
    }
    constructor() {
        super(PacketId.RoomList)
    }
}
