'use strict'

import * as net from 'net'
import * as uuidv4 from 'uuid/v4'

import { handlePacketData } from './packethandler'

function generateSocketUuid(): string {
  return uuidv4.default()
}

function isDefined(object: any): boolean {
  return typeof object !== 'undefined' && object !== null
}

net.createServer().on('connection', (socket: any | net.Socket) => {
  if (isDefined(socket.uuid) === false) {
    console.log('new client connected' +
      socket.remoteAddress + ':' + socket.remotePort)

    // give the socket an unique uuid
    socket.uuid = generateSocketUuid()
    console.log('new client uuid: ' + socket.uuid)

    socket.setEncoding('ascii')

    // welcome new client
    socket.write('~SERVERCONNECTED\n\0')
    console.log('welcomed message to ' + socket.uuid)
  } else {
    throw Error('client reconnected!')
  }

  socket.on('data', (data: Buffer) => {
    // ensure we're working with a buffer
    if (typeof data !== 'Buffer' as string) {
      data = Buffer.from(data)
    }
    handlePacketData(socket, data)
  })

  socket.on('error', (err: Error) => {
    console.log('socket ' + socket.uuid + ' had an error')
    throw err
  })

  socket.on('close', (hadError: boolean) => {
    console.log('client ' + socket.uuid + ' closed socket hadError: ' + hadError)
  })

  socket.on('end', () => {
    console.log('client ' + socket.uuid + ' closed socket ended')
  })

  socket.on('timeout', () => {
    console.log('client ' + socket.uuid + ' socket timed out')
  })
}).on('end', () => {
  console.log('server ended')
}).on('error', (err) => {
  console.log('server error: ' + err)
  throw err
}).on('listen', () => {
  console.log('started')
}).listen(30001)

console.log('server is listening on 30001')
