import { WritableStreamBuffer } from 'stream-buffers';

import { ValToBuffer } from '../../../util';

export class HostGameStart {
    private hostUserId: number

    constructor(hostUserId: number) {
        this.hostUserId = hostUserId
    }

    public build(outStream: WritableStreamBuffer): void {
        outStream.write(ValToBuffer(this.hostUserId, 4))
    }
}
