import { Uint64LE } from 'int64-buffer';

export function ValToBuffer(val: number | Uint64LE, length: number): Buffer {
    const buf: Buffer = new Buffer(length)
    switch (length) {
        case 1:
            buf.writeUInt8(val as number, 0)
            break
        case 2:
            buf.writeUInt16LE(val as number, 0)
            break
        case 4:
            buf.writeUInt32LE(val as number, 0)
            break
        case 8:
            return (val as Uint64LE).toBuffer()
        default:
            throw new Error('Unknown value length used!')
    }
    return buf
}
