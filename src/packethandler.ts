import * as hexy from 'hexy';
import { Uint64LE } from 'int64-buffer';
import * as net from 'net'

import { handlerFuncs } from './packethandlerfuncs'
import { IncomingPacket } from './packets/incoming/packet'

export function handlePacketData(socket: any | net.Socket, data: Buffer) {
    const packet = new IncomingPacket(data)

    if (packet.isValid() === false) {
        console.log('this packet is invalid')
    }

    console.log('packet from ' + socket.uuid + ' - sequence: ' + packet.sequence + ' length: ' + packet.length)

    const func: (uuid: string, inData: Buffer) => Buffer = handlerFuncs.get(packet.id)

    if (func == null) {
        console.log('unknown packet id ' + packet.id + ' from ' + socket.uuid)
        return
    }

    socket.write(func(socket.uuid, data))
}
