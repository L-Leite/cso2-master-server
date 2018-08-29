import { onRoomPacket } from './handlers/room'
import { onLoginPacket } from './handlers/user'
import { onVersionPacket } from './handlers/version'
import { PacketId } from './packets/definitions'

type PacketHandlerFunc = (uuid: string, inData: Buffer) => Buffer

export let handlerFuncs: Map<PacketId, PacketHandlerFunc> = new Map(
    [
        [PacketId.Login, onLoginPacket],
        [PacketId.Room, onRoomPacket],
        [PacketId.Version, onVersionPacket],
    ])
