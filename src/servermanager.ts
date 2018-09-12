import * as net from 'net'
import * as uuidv4 from 'uuid/v4'

import { ExtendedSocket } from './extendedsocket'
import { PacketManager } from './packetevents'

/**
 * Used to handle the server and sockets callbacks
 * It stores a list of the connected sockets
 * and a reference to our server instance
 * @class ServerManager
 */
export class ServerManager {
    /**
     * Stores a list of the connected sockets
     */
    public static connectedSockets: ExtendedSocket[] = []

    /**
     * A reference to our server instance
     */
    public static serverInstance: net.Server = null

    /**
     * Finds a socket by its uuid
     * @param uuid - the uuid used in the search
     */
    public static getSocketByUuid(uuid: string): ExtendedSocket {
        for (const socket of this.connectedSockets) {
            if (socket.uuid === uuid) {
                return socket
            }
        }
        return null
    }

    /**
     * Called when the server stops
     */
    public static onServerEnd(): void {
        console.log('server ended')
    }

    /**
     * Called when a server error occurs
     * @param err - the server error
     */
    public static onServerError(err: Error): void {
        console.log('server error: ' + err.message)
        throw err
    }

    /**
     * Called when the server starts listening
     */
    public static onServerListening(): void {
        const address: net.AddressInfo =
            this.serverInstance.address() as net.AddressInfo
        console.log('server is now started listening at ' +
            address.address + ':' + address.port)
    }

    /**
     * Called when a new connection is created
     * @param socket - the new connection's socket
     */
    public static onServerConnection(socket: net.Socket): void {
        const newSocket: ExtendedSocket = ExtendedSocket.from(socket)
        // add the socket to the socket list
        this.connectedSockets.push(newSocket)

        // treat data as 'hex'
        newSocket.setEncoding('hex')

        // give the socket an unique uuid
        newSocket.uuid = this.generateUuid()

        // init sequence number
        newSocket.initSeq()

        // welcome new client
        newSocket.write(this.welcomeMessage)

        console.log('new client connected' +
            newSocket.remoteAddress + ':' + newSocket.remotePort +
            'uuid: ' + newSocket.uuid)

        // setup socket callbacks
        newSocket.on('data', (data: string) => {
            ServerManager.onSocketData(newSocket, data)
        })

        newSocket.on('error', (err: Error) => {
            ServerManager.onSocketError(newSocket, err)
        })

        newSocket.on('close', (hadError: boolean) => {
            ServerManager.onSocketClose(newSocket, hadError)
        })

        newSocket.on('end', () => {
            ServerManager.onSocketEnd(newSocket)
        })

        newSocket.on('timeout', () => {
            ServerManager.onSocketTimeout(newSocket)
        })
    }

    /**
     * The welcome message sent to the client
     */
    private static readonly welcomeMessage: string = '~SERVERCONNECTED\n\0'

    /**
     * Called when a socket receives data
     * @param socket - the client's socket
     * @param data - the data received from the client
     */
    private static onSocketData(socket: ExtendedSocket, data: string): void {
        // the data comes in as a string, so we need to convert it to a buffer
        const newData: Buffer = Buffer.from(data, 'hex')
        // process the received data
        const res: Buffer = PacketManager.handlePacket(socket, newData)

        if (res != null) {
            // write it to the client
            socket.write(res)
        }
    }

    /**
     * Called when a socket has an error
     * @param socket - the client's socket
     * @param err - the occured error
     */
    private static onSocketError(socket: ExtendedSocket, err: Error): void {
        console.log('socket ' + socket.uuid + ' had an error')
        throw err
    }

    /**
     * Called when a socket closes connection
     * @param socket - the client's socket
     * @param hadError - true if it was closed because of an error
     */
    private static onSocketClose(socket: ExtendedSocket, hadError: boolean): void {
        console.log('socket ' + socket.uuid + ' closed hadError: ' + hadError)
    }

    /**
     * Called when a socket ends connection
     * @param socket - the client's socket
     */
    private static onSocketEnd(socket: ExtendedSocket): void {
        console.log('socket ' + socket.uuid + ' ended')
    }

    /**
     * Called when a socket times out
     * @param socket - the client's socket
     */
    private static onSocketTimeout(socket: ExtendedSocket): void {
        console.log('socket ' + socket.uuid + ' timed out')
    }

    /**
     * Generates an uuid to identify the sockets
     * @returns an uuid string
     */
    private static generateUuid(): string {
        return uuidv4.default()
    }
}
