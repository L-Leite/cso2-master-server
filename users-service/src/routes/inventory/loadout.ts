import express from 'express'

import { ToPostgresError } from 'db'
import { LogInstance } from 'log/loginstance'

import { InventoryLoadout, ISetLoadoutBody } from 'entities/inventory/loadout'

/**
 * handles requests to /inventory/:userId/loadout
 */
export class InventoryLoadoutRoute {
    public static InstallRoutes(app: express.Express): void {
        app.route('/inventory/:userId/loadout')
            .post((req: express.Request, res: express.Response) =>
                InventoryLoadoutRoute.onPostInventoryLoadout(req, res)
            )
            .delete((req: express.Request, res: express.Response) =>
                InventoryLoadoutRoute.onDeleteInventoryLoadout(req, res)
            )

        app.route('/inventory/:userId/loadout/:loadoutNum')
            .get((req: express.Request, res: express.Response) =>
                InventoryLoadoutRoute.onGetInventoryLoadout(req, res)
            )
            .put((req: express.Request, res: express.Response) =>
                InventoryLoadoutRoute.onPutInventoryLoadout(req, res)
            )
    }

    /**
     * called when a GET request to /inventory/:userId/loadout is done
     * gets an user's loadout
     * returns 200 if successful
     * returns 400 if the request is malformed
     * returns 404 if the user doesn't exist
     * returns 500 if an internal unknown error occured
     * @param req the request data
     * @param res the response data
     * @param next the next request handler
     */
    private static async onGetInventoryLoadout(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const reqUserId = Number(req.params.userId)
        const reqLoadoutNum = Number(req.params.loadoutNum)

        if (isNaN(reqUserId) || isNaN(reqLoadoutNum)) {
            return res.status(400).end()
        }

        try {
            const loadout: InventoryLoadout = await InventoryLoadout.getById(
                reqLoadoutNum,
                reqUserId
            )
            if (loadout != null) {
                return res.status(200).json(loadout).end()
            } else {
                return res.status(404).end()
            }
        } catch (error) {
            LogInstance.error(error)
            return res.status(500).end()
        }
    }

    /**
     * called when a POST request to /inventory/:userId/loadout is done
     * create loadouts for an user
     * returns 201 if created successfully
     * returns 400 if the request is malformed
     * returns 409 if the user already has loadouts
     * returns 500 if an internal unknown error occured
     * @param req the request data
     * @param res the response data
     * @param next the next request handler
     */
    private static async onPostInventoryLoadout(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const reqUserId = Number(req.params.userId)

        if (isNaN(reqUserId)) {
            return res.status(400).end()
        }

        try {
            const newLoadouts: InventoryLoadout[] = await InventoryLoadout.create(
                reqUserId
            )
            return res.status(201).json(newLoadouts).end()
        } catch (error) {
            const postgresErr = ToPostgresError(error)
            if (postgresErr != null) {
                if (postgresErr.code === '23505') {
                    LogInstance.warn(
                        `Tried to create loadouts for an existing user (${reqUserId})`
                    )
                    return res.status(409).end()
                }
            }
            LogInstance.error(error)
            return res.status(500).end()
        }
    }

    /**
     * called when a PUT request to /inventory/:userId/cosmetics is done
     * sets an user's equipped cosmetics
     * returns 200 if set successfully
     * returns 400 if the request is malformed
     * returns 404 if the user doesn't exist
     * returns 500 if an internal unknown error occured
     * @param req the request data
     * @param res the response data
     * @param next the next request handler
     */
    private static async onPutInventoryLoadout(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const reqUserId = Number(req.params.userId)
        const reqLoadoutNum = Number(req.params.loadoutNum)
        const reqLoadout: ISetLoadoutBody = req.body as ISetLoadoutBody

        if (isNaN(reqUserId) || isNaN(reqLoadoutNum) == null) {
            return res.status(400).end()
        }

        try {
            const wasUpdated: boolean = await InventoryLoadout.set(
                reqLoadout,
                reqUserId,
                reqLoadoutNum
            )
            if (wasUpdated === true) {
                return res.status(200).end()
            } else {
                return res.status(404).end()
            }
        } catch (error) {
            LogInstance.error(error)
            return res.status(500).end()
        }
    }

    /**
     * called when a DELETE request to /inventory/:userId/loadout is done
     * deletes an user's loadouts
     * returns 200 if deleted successfully
     * returns 400 if the request is malformed
     * returns 404 if the user doesn't exist
     * returns 500 if an internal unknown error occured
     * @param req the request data
     * @param res the response data
     * @param next the next request handler
     */
    private static async onDeleteInventoryLoadout(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const reqUserId = Number(req.params.userId)

        if (isNaN(reqUserId)) {
            return res.status(400).end()
        }

        try {
            const wasDeleted: boolean = await InventoryLoadout.remove(reqUserId)
            if (wasDeleted === true) {
                return res.status(200).end()
            } else {
                return res.status(404).end()
            }
        } catch (error) {
            LogInstance.error(error)
            return res.status(500).end()
        }
    }
}
