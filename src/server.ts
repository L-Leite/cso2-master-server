'use strict'

import * as net from 'net'

import { ServerManager } from './servermanager'
import { startUdpServer } from './serverudp'

// the port that the server will listen to
const serverPort = 30001
// the port used to holepunch the client's udp ports
const udpHolePunchPort = 30002
// make sure whatever IP you choose is an ipv4, so 'net.Server' uses ipv4's.
// we must do this because the client only supports ipv4's
const serverHost = '127.0.0.1'

// create server and set event callbacks
const server: net.Server =
  net.createServer().on('connection', (socket: any | net.Socket) => {
    ServerManager.onServerConnection(socket)
  }).on('end', () => {
    ServerManager.onServerEnd()
  }).on('error', (err: Error) => {
    ServerManager.onServerError(err)
  }).on('listening', () => {
    ServerManager.serverInstance = server
    ServerManager.onServerListening()
  }).listen(serverPort, serverHost)

startUdpServer(udpHolePunchPort)
