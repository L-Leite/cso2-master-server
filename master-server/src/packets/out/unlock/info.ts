import { OutPacketBase } from 'packets/out/packet'
import { UnlockItemList} from './unlockitem'

export class OutUnlockInfo {
    public static build(outPacket: OutPacketBase): void {
        outPacket.writeUInt16(UnlockItemList.length)

        for(const unlockitem of UnlockItemList){
            unlockitem.build(outPacket)
        }
    }
}

