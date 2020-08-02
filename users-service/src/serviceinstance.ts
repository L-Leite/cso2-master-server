import bodyParser from 'body-parser'
import express from 'express'
import helmet from 'helmet'
import http from 'http'
import morgan from 'morgan'

import { LogInstance } from 'log/loginstance'
import { MorganToWinstonStream } from 'log/morgan2winston'

import { PingRoute } from 'routes/ping'
import { UsersRoute } from 'routes/users'
import { InventoryBuyMenuRoute } from 'routes/inventory/buymenu'
import { InventoryCosmeticsRoute } from 'routes/inventory/cosmetics'
import { InventoryRoute } from 'routes/inventory/inventory'
import { InventoryLoadoutRoute } from 'routes/inventory/loadout'
import { InitSql, ShutdownSql } from 'db'

/**
 * the service's entrypoint
 */
export class ServiceInstance {
    /**
     * check if the required environment variables are set on start
     * throws an error if one is missing
     */
    private static checkEnvVars(): void {
        if (process.env.USERS_PORT == null) {
            throw new Error('USERS_PORT environment variable is not set.')
        }
    }

    public app: express.Express
    private server: http.Server

    constructor() {
        ServiceInstance.checkEnvVars()

        this.app = express()

        this.initLog()
        InitSql()

        this.initRouter()
        this.setupRoutes()

        this.app.set('port', process.env.USERS_PORT)
    }

    /**
     * start the service
     */
    public listen(): void {
        this.server = this.app.listen(this.app.get('port'))
        LogInstance.info('Started user service')
        LogInstance.info(`Listening at ${this.app.get('port') as string}`)
    }

    /**
     * stop the service instance
     */
    public async stop(): Promise<void> {
        this.server.close()
        await ShutdownSql()
    }

    /**
     * setup service logging
     */
    private initLog(): void {
        // set the log format according to the current environment
        const morganLogFormat: string = this.isDevEnv() ? 'dev' : 'common'

        // use morgan as middleware, and pass the logs to winston
        this.app.use(
            morgan(morganLogFormat, { stream: new MorganToWinstonStream() })
        )
    }

    /**
     * init and apply middleware to the router
     */
    private initRouter(): void {
        // init BigInt JSON parser
        if ('toJSON' in BigInt.prototype === false) {
            Object.defineProperty(BigInt.prototype, 'toJSON', {
                value: () => {
                    return this.toString()
                }
            })
        }

        // parse json
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({ extended: true }))

        // setup helmet
        this.app.use(helmet({ frameguard: false }))
    }

    /**
     * setup the service's API routes
     */
    private setupRoutes(): void {
        UsersRoute.InstallRoutes(this.app)
        InventoryRoute.InstallRoutes(this.app)
        InventoryBuyMenuRoute.InstallRoutes(this.app)
        InventoryCosmeticsRoute.InstallRoutes(this.app)
        InventoryLoadoutRoute.InstallRoutes(this.app)

        PingRoute.InstallRoutes(this.app)
    }

    /**
     * are we in a development environment?
     * @returns true if so, false if not
     */
    private isDevEnv(): boolean {
        return process.env.NODE_ENV === 'development'
    }
}
