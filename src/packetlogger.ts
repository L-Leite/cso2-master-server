import fs from 'fs'
import path from 'path'

import { ExtendedSocket } from 'extendedsocket'
import { InPacketBase } from 'packets/in/packet'

function padNumber(n: number): string {
    return n > 9 ? '' + n : '0' + n
}

/**
 * logs incoming and outgoing packets to files
 * @class PacketLogger
 */
export class PacketLogger {
    private static curPacket = 0

    private static clearDirectory(dir: string): void {
        const files: string[] = fs.readdirSync(dir)

        for (const file of files) {
            fs.unlinkSync(path.join(dir, file))
        }
    }
    private inPath: string
    private outPath: string

    constructor(baseDir: string = 'packets',
                incomingDir: string = 'in',
                outgoingDir: string = 'out') {
        this.inPath = baseDir + '/' + incomingDir + '/'
        this.outPath = baseDir + '/' + outgoingDir + '/'

        console.log('PacketDumper: using %s as incoming dir', this.inPath)
        console.log('PacketDumper: using %s as outgoing dir', this.outPath)

        try {
            if (fs.existsSync(baseDir) === false) {
                fs.mkdirSync(baseDir)
            }

            if (fs.existsSync(this.inPath) === true) {
                console.log('PacketDumper, cleaning in dir')
                PacketLogger.clearDirectory(this.inPath)
            } else {
                fs.mkdirSync(this.inPath)
            }

            if (fs.existsSync(this.outPath) === true) {
                console.log('PacketDumper, cleaning out dir')
                PacketLogger.clearDirectory(this.outPath)
            } else {
                fs.mkdirSync(this.outPath)
            }
        } catch (error) {
            console.warn(error)
        }
    }

    /**
     * logs incoming packet
     * @param inPacket the packet to log
     */
    public dumpIn(inPacket: InPacketBase, sourceSocket: ExtendedSocket): void {
        const packetPath: string = this.inPath +
            sourceSocket.uuid +
            '_' +
            padNumber(inPacket.sequence) +
            '-' +
            inPacket.id +
            '.bin'

        fs.writeFileSync(packetPath, inPacket.getData(), {
            encoding: 'binary',
            flag: 'w',
        })
    }

    /**
     * logs outgoing packet
     * @param outData the packet data to log
     */
    public dumpOut(outData: Buffer, sourceSocket: ExtendedSocket) {
        // parse the out packet as an in packet
        // the header is the same
        const packet: InPacketBase = new InPacketBase(outData)

        const packetPath: string = this.outPath +
            sourceSocket.uuid +
            '_' +
            padNumber(sourceSocket.getRealSeq()) +
            '-' +
            packet.id +
            '.bin'

        fs.writeFileSync(packetPath, packet.getData(), {
            encoding: 'binary',
            flag: 'w',
        })
    }
}
