import bodyParser from 'body-parser'
import crypto from 'crypto'
import express from 'express'
import session from 'express-session'
import helmet from 'helmet'
import http from 'http'
import morgan from 'morgan'
import favicon from 'serve-favicon'

import { LogInstance } from 'log/loginstance'
import { MorganToWinstonStream } from 'log/morgan2winston'

import { WebController } from 'controller/web'
import { MapImageList } from 'maps'

const sessionSettings: session.SessionOptions = {
    secret: crypto.randomBytes(32).toString('hex'),
    name: 'cso2-web-session',
    cookie: {
        maxAge: 1000 * 60 * 30,
        sameSite: true
    },
    resave: false,
    saveUninitialized: false
}

/**
 * the service's entrypoint
 */
export class ServiceInstance {
    public app: express.Express
    private server: http.Server

    constructor() {
        this.app = express()

        this.applyConfigs()
        this.setupRoutes()

        this.app.set('port', process.env.WEBAPP_PORT)
    }

    /**
     * start the service
     */
    public async listen(): Promise<void> {
        await MapImageList.build()

        LogInstance.info(`Found ${MapImageList.getNumOfFiles()} map images`)

        this.server = this.app.listen(this.app.get('port'))

        LogInstance.info('Started web page service')
        LogInstance.info(`Listening at ${this.app.get('port') as number}`)
    }

    /**
     * stop the service instance
     */
    public stop(): void {
        this.server.close()
    }

    /**
     * apply configurations to the service
     */
    private applyConfigs(): void {
        // set the log format according to the current environment
        let morganLogFormat = ''

        if (this.isDevEnv()) {
            morganLogFormat = 'dev'
            sessionSettings.cookie.secure = false
        } else {
            morganLogFormat = 'common'
            // sessionSettings.cookie.secure = true
        }

        // use morgan as middleware, and pass the logs to winston
        this.app.use(
            morgan(morganLogFormat, { stream: new MorganToWinstonStream() })
        )

        // parse json
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({ extended: true }))

        // setup helmet
        this.app.use(helmet({ frameguard: false }))

        // use session with cookies
        this.app.use(session(sessionSettings))

        // use pug
        this.app.set('views', 'src/views')
        this.app.set('view engine', 'pug')

        // set static files location
        this.app.use('/static', express.static('public'))

        // set favicon
        this.app.use(favicon('public/favicon.ico'))
    }

    /**
     * setup the service's API routes
     */
    private setupRoutes(): void {
        WebController.setup(this.app)
    }

    /**
     * are we in a development environment?
     * @returns true if so, false if not
     */
    private isDevEnv(): boolean {
        return process.env.NODE_ENV === 'development'
    }
}
