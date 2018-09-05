import { Uint64LE } from 'int64-buffer';
import { WritableStreamBuffer } from 'stream-buffers';

import { ValToBuffer } from '../../../util';

/**
 * joins a host's match
 * @class HostJoinHost
 */
export class HostJoinHost {
    private hostUserId: number
    private unk00: Uint64LE

    constructor(hostUserId: number) {
        this.hostUserId = hostUserId
        this.unk00 = new Uint64LE(0)
    }

    public build(outStream: WritableStreamBuffer): void {
        outStream.write(ValToBuffer(this.hostUserId, 4))
        outStream.write(ValToBuffer(this.unk00, 8))
    }
}
