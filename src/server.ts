'use strict'

import * as net from 'net'

import { ServerManager } from './servermanager'
import { startUdpServer } from './serverudp'

// the port that the server will listen to
const serverPort = 30001

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
  }).listen(serverPort)

startUdpServer()
