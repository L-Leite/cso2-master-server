'use strict'

import hexy from 'hexy'
import * as net from 'net'
import * as uuidv4 from 'uuid/v4'

import { Uint64LE } from 'int64-buffer';
import { PacketId } from './packets/definitions'
import { IncomingLoginPacket } from './packets/incoming/login'
import { IncomingPacket } from './packets/incoming/packet'
import { IncomingVersionPacket } from './packets/incoming/version'
import { OutgoingUserInfoPacket } from './packets/outgoing/userinfo'
import { OutgoingUserStartPacket } from './packets/outgoing/userstart'
import { OutgoingVersionPacket } from './packets/outgoing/version'

function generateSocketId(): string {
  return uuidv4.default()
}

function isDefined(object: any): boolean {
  return typeof object !== 'undefined' && object !== null
}

function onDataReceived(socket: any | net.Socket, data: Buffer) {
  const packet = new IncomingPacket(data)

  if (packet.isValid() === false) {
    console.log('this packet is invalid')
  }

  console.log('packet sequence: ' + packet.sequence + ' length: ' + packet.length)

  switch (packet.id) {
    case PacketId.Version:
      const versionPacket: IncomingVersionPacket = new IncomingVersionPacket(data)
      console.log('its a version packet! hash: ' + versionPacket.clientHash)

      // is the game using the hash at all?
      const versionReply: Buffer = new OutgoingVersionPacket(
        false, '6246015df9a7d1f7311f888e7e861f18', versionPacket.sequence).build()

      // write the response
      socket.write(versionReply)
      console.log('Wrote this to ' + socket.id)
      console.log(hexy.hexy(versionReply))
      break

    case PacketId.Login:
      const loginPacket: IncomingLoginPacket = new IncomingLoginPacket(data)
      console.log('its a login packet! nexonUsername: ' + loginPacket.nexonUsername
        + ' gameUsername: ' + loginPacket.gameUsername
        + ' password: ' + loginPacket.password
        + ' hddHwid: ' + loginPacket.hddHwid
        + ' netCafeId: ' + loginPacket.netCafeId
        + ' userSn: ' + loginPacket.userSn
        + ' isLeague: ' + loginPacket.isLeague)

      const userStartReply: Buffer = new OutgoingUserStartPacket(1,
        loginPacket.gameUsername,
        loginPacket.gameUsername,
        loginPacket.sequence).build()
      const userInfoReply: Buffer = new OutgoingUserInfoPacket(1,
        loginPacket.gameUsername, 254,
        new Uint64LE(100), new Uint64LE(10000000),
        30, 10, 9, 5,
        loginPacket.sequence + 1).build()

      socket.write(userStartReply)
      socket.write(userInfoReply)
      console.log('Wrote this to ' + socket.id)
      console.log(hexy.hexy(userStartReply))
      console.log(hexy.hexy(userInfoReply))
      break

    default:
      console.log('unknown packet id ' + packet.id)
  }
}

// let connectCount = 0

net.createServer().on('connection', (socket: any | net.Socket) => {
  if (isDefined(socket.id) === false) {
    console.log('new client connected' +
      socket.remoteAddress + ':' + socket.remotePort)

    // give the socket an unique id
    socket.id = generateSocketId()
    console.log('new client id: ' + socket.id)

    socket.setEncoding('ascii')

    // welcome new client
    socket.write('~SERVERCONNECTED\n\0')
    console.log('wrote welcome message to ' + socket.id)
  } else {
    throw Error('client reconnected!')
  }

  socket.on('data', (data: Buffer) => {
    // ensure we're working with a buffer
    if (typeof data !== 'Buffer' as string) {
      data = Buffer.from(data)
    }

    console.log('received data from ' + socket.id)
    console.log(hexy.hexy(data))
    onDataReceived(socket, data)
  })

  socket.on('error', (err: Error) => {
    console.log('socket ' + socket.id + ' had an error')
    throw err
  })

  socket.on('close', (hadError: boolean) => {
    console.log('client ' + socket.id + ' closed socket hadError: ' + hadError)
  })

  socket.on('end', () => {
    console.log('client ' + socket.id + ' closed socket ended')
  })

  socket.on('timeout', () => {
    console.log('client ' + socket.id + ' socket timed out')
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
