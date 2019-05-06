import { PingService } from 'pingservice'

export function userSvcAuthority(): string {
    return process.env.USERSERVICE_HOST + ':' + process.env.USERSERVICE_PORT
}

export function inventorySvcAuthority(): string {
    return process.env.INVSERVICE_HOST + ':' + process.env.INVSERVICE_PORT
}

export const UserSvcPing: PingService = new PingService(userSvcAuthority())
export const InventorySvcPing: PingService = new PingService(inventorySvcAuthority())
