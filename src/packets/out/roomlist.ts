import { WritableStreamBuffer } from 'stream-buffers'

import { PacketId } from 'packets/definitions'
import { OutPacketBase } from 'packets/out/packet'
import { RoomListCollection } from 'packets/out/roomlist/collection'

import { Room } from 'room/room'

import { ExtendedSocket } from 'extendedsocket'

enum OutRoomListType {
    SendFullRoomList = 0,
}

/**
 * outgoing room host information
 * @class OutHostPacket
 */
export class OutRoomListPacket extends OutPacketBase {
    constructor(socket: ExtendedSocket) {
        super(socket, PacketId.RoomList)
    }

    public getFullList(rooms: Room[]): Buffer {
        this.outStream = new WritableStreamBuffer(
            { initialSize: 100, incrementAmount: 20 })

        this.buildHeader()
        this.writeUInt8(OutRoomListType.SendFullRoomList)

        new RoomListCollection(rooms).build(this)

        return this.getData()
    }
}
