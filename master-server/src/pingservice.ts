import superagent from 'superagent'

const PING_ALIVE_DELAY: number = 1000 * 15
const PING_DOWN_DELAY: number = 1000 * 5

/**
 * checks if a service is alive every x seconds
 */
export class PingService {
    /**
     * pings a service to check if they're online
     * @param thisInstance the callee's PingService instance
     */
    private static async onPingCheck(thisInstance: PingService): Promise<void> {
        try {
            const res: superagent.Response = await superagent
                .get(thisInstance.host + '/ping')
                .accept('json')
            thisInstance.updateDelay(res.status === 200)
        } catch (error) {
            thisInstance.updateDelay(false)
        }
    }

    private host: string
    private alive: boolean
    private timerId: NodeJS.Timeout

    constructor(host: string) {
        this.host = host
    }

    /**
     * performs a ping to the host
     */
    public async checkNow(): Promise<void> {
        await PingService.onPingCheck(this)
    }

    /**
     * get the host being checked
     */
    public getHost(): string {
        return this.host
    }

    /**
     * is the service up?
     * @returns true if so, false if not
     */
    public isAlive(): boolean {
        return this.alive
    }

    /**
     * stops the ping check
     */
    public stopTimer(): void {
        clearInterval(this.timerId)
    }

    /**
     * updates the ping check interval according to the alive state
     * @param isAlive the new alive state
     */
    private updateDelay(isAlive: boolean): void {
        if (this.alive === isAlive) {
            return
        }

        console.warn(
            'Host ' + this.host + ' is now ' + (isAlive ? 'up' : 'down')
        )

        clearInterval(this.timerId)
        this.timerId = setInterval(
            () => {
                void PingService.onPingCheck(this)
            },
            isAlive ? PING_ALIVE_DELAY : PING_DOWN_DELAY
        )

        this.alive = isAlive
    }
}
