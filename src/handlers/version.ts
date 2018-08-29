import { IncomingVersionPacket } from '../packets/incoming/version'
import { OutgoingVersionPacket } from '../packets/outgoing/version'

export function onVersionPacket(uuid: string, inData: Buffer): Buffer {
    const versionPacket: IncomingVersionPacket = new IncomingVersionPacket(inData)
    console.log(uuid + ' requested a version packet. clientHash: ' + versionPacket.clientHash)

    const versionReply: Buffer = new OutgoingVersionPacket(
        false, '6246015df9a7d1f7311f888e7e861f18', versionPacket.sequence).build()

    return versionReply
}
