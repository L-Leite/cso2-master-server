import dgram from 'dgram'
import net from 'net'
import uuidv4 from 'uuid/v4'

import { ExtendedSocket } from 'extendedsocket'

import { PacketId } from 'packets/definitions'
import { InPacketBase } from 'packets/in/packet'

import { InHolepunchPacketUdp } from 'packets/holepunch/inholepunch'
import { OutHolepunchPacketUdp } from 'packets/holepunch/outholepunch'

import { User } from 'user/user'
import { UserManager } from 'user/usermanager'

import { ChannelManager } from 'channel/channelmanager'

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
 * Generates an uuid to identify the sockets
 * @returns an uuid string
 */
function generateUuid(): string {
    return uuidv4()
}

/**
 * Used to handle the server and sockets callbacks
 * It stores a list of the connected sockets
 * and a reference to our server instance
 * @class ServerManager
 */
export class ServerInstance {
    public users: UserManager
    public channels: ChannelManager

    private server: net.Server
    private holepunchServer: dgram.Socket
    private masterPort: number
    private holepunchPort: number
    private hostname: string
    private sockets: ExtendedSocket[]

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
        this.holepunchServer = dgram.createSocket('udp4');
        this.sockets = []

        this.users = new UserManager()
        this.channels = new ChannelManager()

        if (options.shouldLogPackets) {
            this.packetLogging = new PacketLogger()
        }

        this.server.on('connection', (socket: net.Socket) => {
            this.onServerConnection(socket)
        }).on('end', () => {
            this.onServerEnd()
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

    public listen(): void {
        this.server.listen(this.masterPort, this.hostname)
        this.holepunchServer.bind(this.holepunchPort, this.hostname)
    }

    /**
     * Called when a new connection is created
     * @param socket - the new connection's socket
     */
    private onServerConnection(socket: net.Socket): void {
        const newSocket: ExtendedSocket = this.addSocket(socket)

        // welcome new client
        newSocket.write(clientWelcomeMessage)

        console.log('new client connected ' +
            newSocket.remoteAddress + ':' + newSocket.remotePort +
            ' uuid: ' + newSocket.uuid)

        // setup socket callbacks
        newSocket.on('data', (data: string) => {
            this.onSocketData(newSocket, data)
        })

        newSocket.on('error', (err: Error) => {
            this.onSocketError(newSocket, err)
        })

        newSocket.on('close', (hadError: boolean) => {
            this.onSocketClose(newSocket, hadError)
        })

        newSocket.on('end', () => {
            this.onSocketEnd(newSocket)
        })

        newSocket.on('timeout', () => {
            this.onSocketTimeout(newSocket)
        })
    }

    /**
     * Called when the server stops
     */
    private onServerEnd(): void {
        console.log('server ended')
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
    private onHolepunchMessage(msg: Buffer, rinfo: net.AddressInfo): void {
        const packet: InHolepunchPacketUdp = new InHolepunchPacketUdp(msg)

        if (packet.isParsed() === false) {
            console.warn('%s sent a bad holepunch packet', rinfo.address)
            return
        }

        if (packet.isHeartbeat()) {
            return
        }

        const user: User = this.users.getUserById(packet.userId)

        if (user == null) {
            console.warn('Tried to send hole punch packet to ' + packet.userId)
            return
        }

        const portIndex = user.updateHolepunch(packet.portId, packet.port, rinfo.port)

        if (portIndex === -1) {
            console.warn('Unknown hole punch port')
            return
        }

        user.localIpAddress = packet.ipAddress
        user.externalIpAddress = rinfo.address

        const reply: Buffer = new OutHolepunchPacketUdp(portIndex).build()
        this.holepunchServer.send(reply, packet.port, packet.ipAddress)
    }

    /**
     * Called when a socket receives data
     * @param socket the client's socket
     * @param data the data received from the client
     */
    private onSocketData(socket: ExtendedSocket, data: string): void {
        // the data comes in as a string, so we need to convert it to a buffer
        const newData: Buffer = Buffer.from(data, 'hex')
        // process the received data
        this.processPackets(newData, socket)
    }

    private processPackets(packetData: Buffer, sourceSocket: ExtendedSocket) {
        let curOffset: number = 0
        let curTotalLen: number = 0

        for (let len = packetData.length;
            len >= InPacketBase.headerLength;
            len -= curTotalLen) {
            const pktBuffer: Buffer = packetData.slice(curOffset, curOffset + len)
            const curPacket: InPacketBase = new InPacketBase(pktBuffer)
            const totalPktLen = curPacket.length + InPacketBase.headerLength

            this.onIncomingPacket(curPacket, sourceSocket)

            curTotalLen = totalPktLen
            curOffset += totalPktLen
        }
    }

    /**
     * hands the packet to the appropriate callback
     * @param socket the client's socket
     * @param packet the packet received from the client
     * @returns true if successful, otherwise it failed
     */
    private onIncomingPacket(packet: InPacketBase, sourceSocket: ExtendedSocket): boolean {
        if (packet.isValid() === false) {
            console.warn('bad packet from ' + sourceSocket.uuid)
            return false
        }

        if (this.packetLogging) {
            this.packetLogging.dumpIn(packet, sourceSocket)
        }

        switch (packet.id) {
            case PacketId.Version:
                return this.users.onVersionPacket(packet.getData(), sourceSocket)
            case PacketId.Login:
                return this.users.onLoginPacket(packet.getData(), sourceSocket, this.channels, this.holepunchPort)
            case PacketId.RequestChannels:
                return this.channels.onChannelListPacket(sourceSocket, this.users)
            case PacketId.RequestRoomList:
                return this.channels.onRoomListPacket(packet.getData(), sourceSocket, this.users)
            case PacketId.Room:
                return this.channels.onRoomRequest(packet.getData(), sourceSocket, this.users)
            case PacketId.Host:
                return this.users.onHostPacket(packet.getData(), sourceSocket)
        }

        console.warn('unknown packet id ' + packet.id + ' from ' + sourceSocket.uuid)
        return false
    }

    /**
     * Called when a socket closes connection
     * @param socket the client's socket
     * @param hadError true if it was closed because of an error
     */
    private onSocketClose(socket: ExtendedSocket, hadError: boolean): void {
        console.log('socket ' + socket.uuid + ' closed hadError: ' + hadError)
    }

    /**
     * Called when a socket has an error
     * @param socket the client's socket
     * @param err the occured error
     */
    private onSocketError(socket: ExtendedSocket, err: Error): void {
        console.warn('socket ' + socket.uuid + ' had an error: ' + err)
        this.users.removeUserByUuid(socket.uuid)
        this.removeSocket(socket)
    }

    /**
     * Called when a socket ends connection
     * @param socket the client's socket
     */
    private onSocketEnd(socket: ExtendedSocket): void {
        console.log('socket ' + socket.uuid + ' ended')
        this.users.removeUserByUuid(socket.uuid)
        this.removeSocket(socket)
    }

    /**
     * Called when a socket times out
     * @param socket the client's socket
     */
    private onSocketTimeout(socket: ExtendedSocket): void {
        console.warn('socket ' + socket.uuid + ' timed out')
        this.users.removeUserByUuid(socket.uuid)
        this.removeSocket(socket)
    }

    /**
     * prepare a client's socket with a sequence number and unique id
     * and place it into the connected sockets list
     * @param socket the client's socket
     * @returns the placed socket
     */
    private addSocket(socket: net.Socket): ExtendedSocket {
        const newSocket: ExtendedSocket = ExtendedSocket.from(socket, this.packetLogging)

        // treat data as hexadecimal
        newSocket.setEncoding('hex')
        // give the socket an unique uuid
        newSocket.uuid = generateUuid()
        // init sequence number
        newSocket.resetReq()

        // add the socket to the socket list
        this.sockets.push(newSocket)

        return newSocket
    }

    private removeSocket(socket: ExtendedSocket): void {
        this.sockets.splice(this.sockets.indexOf(socket), 1)
    }
}
