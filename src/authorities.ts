import { PingService } from 'pingservice'

export function userSvcAuthority(): string {
    return 'http://' + process.env.USERSERVICE_HOST + ':' + process.env.USERSERVICE_PORT
}

export const UserSvcPing: PingService = new PingService(userSvcAuthority())
