import express from 'express'

import { SessionCounter } from 'sessioncounter'

/**
 * handles requests to /ping
 */
export class PingRoute {
    public static InstallRoutes(app: express.Express): void {
        app.route('/ping').get((req: express.Request, res: express.Response) =>
            PingRoute.onGetPing(req, res)
        )
    }

    /**
     * called when a GET request to /ping is done
     * tells the requester that we are alive
     * returns 200
     * @param req the request data
     * @param res the response data
     */
    private static onGetPing(
        req: express.Request,
        res: express.Response
    ): void {
        const pingReply = {
            sessions: SessionCounter.Get(),
            uptime: process.uptime()
        }

        return res.status(200).json(pingReply).end()
    }
}
