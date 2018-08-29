export function onRoomPacket(uuid: string, inData: Buffer): Buffer {
    if (inData[5] === 0x13) {
        return Buffer.from([0x55, 0x05, 0x06, 0x00, 0x44, 0x00, 0x01, 0x00, 0x00, 0x00])
    } else {
        return Buffer.from([0])
    }
}
