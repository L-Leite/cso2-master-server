import dgram from 'dgram'
import net from 'net'
import uuid from 'uuid/v4'

import { ExtendedSocket } from 'extendedsocket'

import { PacketId } from 'packets/definitions'
import { InPacketBase } from 'packets/in/packet'

// import { InVersionPacket } from 'packets/in/version'
import { OutVersionPacket } from 'packets/out/version'

import { InHolepunchPacketUdp } from 'packets/holepunch/inholepunch'
import { OutHolepunchPacketUdp } from 'packets/holepunch/outholepunch'

import { ChannelManager } from 'channel/channelmanager'
import { Room } from 'room/room'
import { UserManager } from 'user/usermanager'
import { UserSession } from 'user/usersession'

import { PacketLogger } from 'packetlogger'

/**
 * The welcome message sent to the client
 */
const clientWelcomeMessage: string = '~SERVERCONNECTED\n\0'

export interface IServerOptions {
    hostname: string,
    portMaster: number,
    portHolepunch: number,
    shouldLogPackets?: boolean,
}

/**
 * Used to handle the server and sockets callbacks
 * It stores a list of the connected sockets
 * and a reference to our server instance
 * @class ServerManager
 */
export class ServerInstance {
    private static onVersionPacket(versionData: Buffer, sourceConn: ExtendedSocket): boolean {
        /*const versionPacket: InVersionPacket = new InVersionPacket(versionData)
        console.log(sourceConn.uuid + ' sent a version packet. clientHash: '
            + versionPacket.clientHash)*/

        // i think the client ignores the hash string
        sourceConn.send(new OutVersionPacket(
            false, '6246015df9a7d1f7311f888e7e861f18'))

        return true
    }

    private server: net.Server
    private holepunchServer: dgram.Socket
    private masterPort: number
    private holepunchPort: number
    private hostname: string

    private packetLogging: PacketLogger

    /**
     * constructs our server instance
     * @param options the server options
     */
    constructor(options: IServerOptions) {
        this.masterPort = options.portMaster
        this.holepunchPort = options.portHolepunch
        this.hostname = options.hostname

        this.server = net.createServer()
        this.holepunchServer = dgram.createSocket('udp4')

        if (options.shouldLogPackets) {
            this.packetLogging = new PacketLogger()
        }

        this.server.on('connection', (socket: net.Socket) => {
            this.onServerConnection(socket)
        }).on('close', () => {
            this.onServerClose()
        }).on('error', (err: Error) => {
            this.onServerError(err)
        }).on('listening', () => {
            this.onServerListening()
        })

        this.holepunchServer.on('error', (err: Error) => {
            this.onServerError(err)
        }).on('message', (msg: Buffer, rinfo: net.AddressInfo) => {
            this.onHolepunchMessage(msg, rinfo)
        }).on('listening', () => {
            this.onHolepunchListening()
        })
    }

    public async listen(): Promise<void> {
        // clean up any left over user sessions
        await UserSession.deleteAll()

        this.server.listen(this.masterPort, this.hostname)
        this.holepunchServer.bind(this.holepunchPort, this.hostname)
    }

    public async stop(): Promise<void> {
        await UserSession.deleteAll()
        this.server.close()
        process.exit(0)
    }

    /**
     * Called when a new connection is created
     * @param socket - the new connection's socket
     */
    private onServerConnection(socket: net.Socket): void {
        const newConn: ExtendedSocket = this.addSocket(socket)

        // welcome new connection
        newConn.write(clientWelcomeMessage)

        console.debug('new connection created, uuid ' + newConn.uuid)

        // setup socket callbacks
        newConn.on('data', (data: string) => {
            this.onSocketData(newConn, data)
        })

        newConn.on('error', (err: Error) => {
            this.onSocketError(newConn, err)
        })

        newConn.on('close', (hadError: boolean) => {
            this.onSocketClose(newConn, hadError)
        })

        newConn.on('end', () => {
            this.onSocketEnd(newConn)
        })

        newConn.on('timeout', () => {
            this.onSocketTimeout(newConn)
        })
    }

    /**
     * Called when the server stops
     */
    private onServerClose(): void {
        console.log('server closed')
        this.holepunchServer.close()
    }

    /**
     * Called when a server error occurs
     * @param err - the server error
     */
    private onServerError(err: Error): void {
        console.log('server error: ' + err.message)
        throw err
    }

    /**
     * Called when the server starts listening
     */
    private onServerListening(): void {
        const address: net.AddressInfo =
            this.server.address() as net.AddressInfo
        console.log('server is now started listening at ' +
            address.address + ':' + address.port)
    }

    private onHolepunchListening(): void {
        const address: net.AddressInfo = this.holepunchServer.address() as net.AddressInfo
        console.log('holepunch listening at ' + address.address + ':' + address.port)
    }

    /**
     * called when we receive udp holepunch info
     * @param msg the received data
     * @param rinfo the sender's info
     */
    private async onHolepunchMessage(msg: Buffer, rinfo: net.AddressInfo): Promise<void> {
        const packet: InHolepunchPacketUdp = new InHolepunchPacketUdp(msg)

        if (packet.isParsed() === false) {
            console.warn('%s sent a bad holepunch packet', rinfo.address)
            return
        }

        if (packet.isHeartbeat()) {
            return
        }

        const session: UserSession = await UserSession.get(packet.userId)

        if (session == null) {
            console.warn('Couldnt\'t get user ID %i\'s session when holepunching', packet.userId)
            return
        }

        // FIX ME: temporary workaround because Docker sets the NAT IP address when creating a session in usermanager.ts
        /*if (session.externalNet.ipAddress !== rinfo.address) {
            console.warn('Holepunch IP address is different from session\'s IP. Is someone spoofing packets?'
                + 'userId: %i original IP: %s packet IP: %s',
                packet.userId, session.externalNet.ipAddress, rinfo.address)
            return
        }*/

        if (session.shouldUpdatePorts(packet.portId, packet.port, rinfo.port) === false) {
            return
        }

        session.externalNet.ipAddress = rinfo.address
        session.internalNet.ipAddress = packet.ipAddress
        const portIndex = session.setHolepunch(packet.portId, packet.port, rinfo.port)

        if (portIndex === -1) {
            console.warn('Unknown hole punch port')
            return
        }

        session.update()

        const reply: Buffer = new OutHolepunchPacketUdp(portIndex).build()
        this.holepunchServer.send(reply, packet.port, packet.ipAddress)
    }

    /**
     * Called when a socket receives data
     * @param conn the client's socket
     * @param data the data received from the client
     */
    private async onSocketData(conn: ExtendedSocket, data: string): Promise<void> {
        // the data comes in as a string, so we need to convert it to a buffer
        const newData: Buffer = Buffer.from(data, 'hex')
        // process the received data
        this.processPackets(newData, conn)
    }

    private processPackets(packetData: Buffer, conn: ExtendedSocket) {
        let curOffset: number = 0
        let curTotalLen: number = 0

        for (let len = packetData.length;
            len >= InPacketBase.headerLength;
            len -= curTotalLen) {
            const pktBuffer: Buffer = packetData.slice(curOffset, curOffset + len)
            const curPacket: InPacketBase = new InPacketBase(pktBuffer)
            const totalPktLen = curPacket.length + InPacketBase.headerLength

            this.onIncomingPacket(curPacket, conn)

            curTotalLen = totalPktLen
            curOffset += totalPktLen
        }
    }

    /**
     * hands the packet to the appropriate callback
     * @param packet the packet received from the client
     * @param connection represents a connection with the client
     * @returns true if successful, otherwise it failed
     */
    private onIncomingPacket(packet: InPacketBase, connection: ExtendedSocket): boolean {
        if (packet.isValid() === false) {
            console.warn('bad packet from ' + connection.uuid)
            return false
        }

        if (this.packetLogging) {
            this.packetLogging.dumpIn(connection.uuid, connection.getRealSeq(), packet.id, packet.getData())
        }

        switch (packet.id) {
            case PacketId.Version:
                return ServerInstance.onVersionPacket(packet.getData(), connection)
            case PacketId.Login:
                UserManager.onLoginPacket(packet.getData(), connection, this.holepunchPort)
                return true
            case PacketId.RequestChannels:
                ChannelManager.onChannelListPacket(connection)
                return true
            case PacketId.RequestRoomList:
                ChannelManager.onRoomListPacket(packet.getData(), connection)
                return true
            case PacketId.Room:
                ChannelManager.onRoomRequest(packet.getData(), connection)
                return true
            case PacketId.Host:
                UserManager.onHostPacket(packet.getData(), connection)
                return true
            case PacketId.AboutMe:
                UserManager.onAboutmePacket(packet.getData(), connection)
                return true;
            case PacketId.Option:
                UserManager.onOptionPacket(packet.getData(), connection)
                return true
            case PacketId.Favorite:
                UserManager.onFavoritePacket(packet.getData(), connection)
                return true
        }

        console.warn('unknown packet id ' + packet.id + ' from ' + connection.uuid)
        return false
    }

    /**
     * Called when a socket closes connection
     * @param conn the client's connection
     * @param hadError true if it was closed because of an error
     */
    private async onSocketClose(conn: ExtendedSocket, hadError: boolean): Promise<void> {
        console.log('socket ' + conn.uuid + ' closed hadError: ' + hadError)
        await Room.cleanUpUser(conn.getOwner().userId)
        UserSession.delete(conn.getOwner().userId)
    }

    /**
     * Called when a socket has an error
     * @param conn the client's connection
     * @param err the occured error
     */
    private onSocketError(conn: ExtendedSocket, err: Error): void {
        console.warn('socket ' + conn.uuid + ' had an error: ' + err)
    }

    /**
     * Called when a socket ends connection
     * @param conn the client's connection
     */
    private onSocketEnd(conn: ExtendedSocket): void {
        console.log('socket ' + conn.uuid + ' ended')
    }

    /**
     * Called when a socket times out
     * @param conn the client's socket
     */
    private onSocketTimeout(conn: ExtendedSocket): void {
        console.warn('socket ' + conn.uuid + ' timed out')
        conn.destroy(new Error('Connection timed out'))
    }

    /**
     * prepare a client's connection with a sequence number and unique id
     * and place it into the connection list
     * @param conn the client's socket
     * @returns the placed socket
     */
    private addSocket(conn: net.Socket): ExtendedSocket {
        const newConn: ExtendedSocket = ExtendedSocket.from(conn, this.packetLogging)

        // treat data as hexadecimal
        newConn.setEncoding('hex')
        // give the connection an unique uuid
        newConn.uuid = uuid()
        // init sequence number
        newConn.resetReq()

        return newConn
    }
}
