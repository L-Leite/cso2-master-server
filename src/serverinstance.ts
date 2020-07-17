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

import { ActiveConnections } from 'storage/activeconnections'

import { PacketLogger } from 'packetlogger'

import { AchievementHandler } from 'handlers/achievementhandler'
import { ChatHandler } from 'handlers/chathandler'

import { ChatService } from 'services/chatservice'

/**
 * The welcome message sent to the client
 */
const clientWelcomeMessage = '~SERVERCONNECTED\n\0'

export interface IServerOptions {
    hostname: string
    portMaster: number
    portHolepunch: number
    shouldLogPackets?: boolean
}

/**
 * Used to handle the server and sockets callbacks
 * It stores a list of the connected sockets
 * and a reference to our server instance
 * @class ServerManager
 */
export class ServerInstance {
    private static onVersionPacket(
        versionData: Buffer,
        sourceConn: ExtendedSocket
    ): boolean {
        /* const versionPacket: InVersionPacket = new InVersionPacket(versionData)
        console.log(sourceConn.uuid + ' sent a version packet. clientHash: '
            + versionPacket.clientHash)*/

        // i think the client ignores the hash string
        sourceConn.send(
            new OutVersionPacket(false, '6246015df9a7d1f7311f888e7e861f18')
        )

        return true
    }

    private server: net.Server
    private holepunchServer: dgram.Socket
    private masterPort: number
    private holepunchPort: number
    private hostname: string

    private chatSvc: ChatService

    private achievementHandler: AchievementHandler
    private chatHandler: ChatHandler

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

        this.chatSvc = new ChatService('https://implement.me.invalid')

        this.achievementHandler = new AchievementHandler()
        this.chatHandler = new ChatHandler(this.chatSvc)

        if (options.shouldLogPackets) {
            this.packetLogging = new PacketLogger()
        }

        this.server
            .on('connection', (socket: net.Socket) => {
                this.onServerConnection(socket)
            })
            .on('close', () => {
                this.onServerClose()
            })
            .on('error', (err: Error) => {
                this.onServerError(err)
            })
            .on('listening', () => {
                this.onServerListening()
            })

        this.holepunchServer
            .on('error', (err: Error) => {
                this.onServerError(err)
            })
            .on('message', (msg: Buffer, rinfo: net.AddressInfo) => {
                this.onHolepunchMessage(msg, rinfo)
            })
            .on('listening', () => {
                this.onHolepunchListening()
            })
    }

    public listen(): void {
        this.server.listen(this.masterPort, this.hostname)
        this.holepunchServer.bind(this.holepunchPort, this.hostname)
    }

    public stop(): void {
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
            void this.onSocketData(newConn, data)
        })

        newConn.on('error', (err: Error) => {
            this.onSocketError(newConn, err)
        })

        newConn.on('close', (hadError: boolean) => {
            void this.onSocketClose(newConn, hadError)
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
        const address: net.AddressInfo = this.server.address() as net.AddressInfo
        console.log(
            `server is now started listening at ${address.address}:${address.port}`
        )
    }

    private onHolepunchListening(): void {
        const address: net.AddressInfo = this.holepunchServer.address() as net.AddressInfo
        console.log(`holepunch listening at ${address.address}:${address.port}`)
    }

    /**
     * called when we receive udp holepunch info
     * @param msg the received data
     * @param rinfo the sender's info
     */
    private onHolepunchMessage(msg: Buffer, rinfo: net.AddressInfo): void {
        const packet: InHolepunchPacketUdp = new InHolepunchPacketUdp(msg)

        if (packet.isParsed() === false) {
            console.warn('%s sent a bad holepunch packet', rinfo.address)
            return
        }

        if (packet.isHeartbeat()) {
            return
        }

        const conn: ExtendedSocket = ActiveConnections.Singleton().FindByOwnerId(
            packet.userId
        )

        if (conn == null) {
            return
        }

        const session: UserSession = conn.session

        if (session == null) {
            console.warn(
                `Could not get user ID ${packet.userId}'s session when holepunching`
            )
            return
        }

        // FIX ME: temporary workaround because Docker sets the NAT IP address when creating a session in usermanager.ts
        /* if (session.externalNet.ipAddress !== rinfo.address) {
            console.warn('Holepunch IP address is different from session\'s IP. Is someone spoofing packets?'
                + 'userId: %i original IP: %s packet IP: %s',
                packet.userId, session.externalNet.ipAddress, rinfo.address)
            return
        }*/

        if (
            session.shouldUpdatePorts(
                packet.portId,
                packet.port,
                rinfo.port
            ) === false
        ) {
            return
        }

        session.externalNet.ipAddress = rinfo.address
        session.internalNet.ipAddress = packet.ipAddress
        const portIndex = session.setHolepunch(
            packet.portId,
            packet.port,
            rinfo.port
        )

        if (portIndex === -1) {
            console.warn('Unknown hole punch port')
            return
        }

        const reply: Buffer = new OutHolepunchPacketUdp(portIndex).build()
        this.holepunchServer.send(reply, packet.port, packet.ipAddress)
    }

    /**
     * Called when a socket receives data
     * @param conn the client's socket
     * @param data the data received from the client
     */
    private async onSocketData(conn: ExtendedSocket, data: string) {
        // the data comes in as a string, so we need to convert it to a buffer
        const newData: Buffer = Buffer.from(data, 'hex')
        // process the received data
        await this.processPackets(newData, conn)
    }

    private async processPackets(packetData: Buffer, conn: ExtendedSocket) {
        let curOffset = 0
        let curTotalLen = 0

        for (
            let len = packetData.length;
            len >= InPacketBase.headerLength;
            len -= curTotalLen
        ) {
            const pktBuffer: Buffer = packetData.slice(
                curOffset,
                curOffset + len
            )
            const curPacket: InPacketBase = new InPacketBase(pktBuffer)
            const totalPktLen = curPacket.length + InPacketBase.headerLength

            await this.onIncomingPacket(curPacket, conn)

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
    private async onIncomingPacket(
        packet: InPacketBase,
        connection: ExtendedSocket
    ): Promise<boolean> {
        if (packet.isValid() === false) {
            console.warn('bad packet from ' + connection.uuid)
            return false
        }

        const data: Buffer = packet.getData()

        if (this.packetLogging) {
            this.packetLogging.dumpIn(
                connection.uuid,
                connection.getRealSeq(),
                packet.id,
                data
            )
        }

        // the most received packets should go first
        switch (packet.id) {
            case PacketId.Host:
                return await UserManager.onHostPacket(data, connection)
            case PacketId.Room:
                return ChannelManager.onRoomRequest(data, connection)
            case PacketId.Chat:
                return this.chatHandler.OnPacket(data, connection)
            case PacketId.Achievement:
                return this.achievementHandler.OnPacket(data, connection)
            case PacketId.RequestChannels:
                return ChannelManager.onChannelListPacket(connection)
            case PacketId.RequestRoomList:
                return ChannelManager.onRoomListPacket(data, connection)
            case PacketId.AboutMe:
                return await UserManager.onAboutmePacket(data, connection)
            case PacketId.Option:
                return await UserManager.onOptionPacket(data, connection)
            case PacketId.Favorite:
                return await UserManager.onFavoritePacket(data, connection)
            case PacketId.Login:
                return await UserManager.onLoginPacket(
                    data,
                    connection,
                    this.holepunchPort
                )
            case PacketId.Version:
                return ServerInstance.onVersionPacket(data, connection)
        }

        console.warn(`unknown packet id ${packet.id} from ${connection.uuid}`)
        return false
    }

    /**
     * Called when a socket closes connection
     * @param conn the client's connection
     * @param hadError true if it was closed because of an error
     */
    private async onSocketClose(
        conn: ExtendedSocket,
        hadError: boolean
    ): Promise<void> {
        console.log(
            `socket ${conn.uuid} closed hadError: ${
                hadError ? 'true' : 'false'
            }`
        )
        Room.cleanUpUser(conn)
        await UserManager.OnSocketClosed(conn)
        ActiveConnections.Singleton().Remove(conn)
    }

    /**
     * Called when a socket has an error
     * @param conn the client's connection
     * @param err the occured error
     */
    private onSocketError(conn: ExtendedSocket, err: Error): void {
        console.warn(`socket ${conn.uuid} had an error: ${err.name}`)
    }

    /**
     * Called when a socket ends connection
     * @param conn the client's connection
     */
    private onSocketEnd(conn: ExtendedSocket): void {
        console.log(`socket ${conn.uuid} ended`)
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
        const newConn: ExtendedSocket = ExtendedSocket.from(
            conn,
            this.packetLogging
        )

        // treat data as hexadecimal
        newConn.setEncoding('hex')
        // give the connection an unique uuid
        newConn.uuid = uuid()
        // init sequence number
        newConn.resetReq()

        return newConn
    }
}
