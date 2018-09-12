import * as dgram from 'dgram'
import * as net from 'net'

import { HpPortType, InHolepunchPacketUdp } from './packets/udp/inholepunch'
import { OutHolepunchPacketUdp } from './packets/udp/outholepunch'
import { UserData } from './userdata';
import { UserStorage } from './userstorage';

const server: dgram.Socket = dgram.createSocket('udp4');

server.on('error', (err: Error) => {
    console.log('server error ' + err.message)
    server.close()
})

server.on('message', (msg: Buffer, rinfo: net.AddressInfo) => {
    const packet: InHolepunchPacketUdp = new InHolepunchPacketUdp(msg)
    // console.log('message from ' + rinfo.address + ':' + rinfo.port + ': ' + msg)
    if (packet.portId != null) {
        const user: UserData = UserStorage.getUser(packet.userId)
        let portIndex = 0
        switch (packet.portId) {
            case HpPortType.Client:
                user.localClientPort = packet.port
                user.externalClientPort = rinfo.port
                portIndex = 0
                break
            case HpPortType.Server:
                user.localServerPort = packet.port
                user.externalServerPort = rinfo.port
                portIndex = 1
                break
            case HpPortType.SourceTV:
                user.localTvPort = packet.port
                user.externalTvPort = rinfo.port
                portIndex = 2
                break
        }
        user.localIpAddress = packet.ipAddress
        // user.port = packet.port
        const reply: Buffer = new OutHolepunchPacketUdp(portIndex).build()
        server.send(reply, packet.port, packet.ipAddress)
    }
});

server.on('listening', () => {
    const address: net.AddressInfo = server.address() as net.AddressInfo
    console.log('server listening ' + address.address + ':' + address.port)
})

export function startUdpServer() {
    server.bind(30002)
}
