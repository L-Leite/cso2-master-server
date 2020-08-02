import express from 'express'

import { ToPostgresError } from 'db'
import { LogInstance } from 'log/loginstance'

import { Inventory } from 'entities/inventory/inventory'

/**
 * handles requests to /inventory/:userId
 */
export class InventoryRoute {
    public static InstallRoutes(app: express.Express): void {
        app.route('/inventory/:userId')
            .get((req: express.Request, res: express.Response) =>
                InventoryRoute.onGetInventory(req, res)
            )
            .post((req: express.Request, res: express.Response) =>
                InventoryRoute.onPostInventory(req, res)
            )
            .delete((req: express.Request, res: express.Response) =>
                InventoryRoute.onDeleteInventory(req, res)
            )
        app.route('/inventory/:userId/item')
            .put((req: express.Request, res: express.Response) =>
                InventoryRoute.onPutInventoryItem(req, res)
            )
            .delete((req: express.Request, res: express.Response) =>
                InventoryRoute.onDeleteInventoryItem(req, res)
            )
    }

    /**
     * called when a GET request to /inventory/:userId is done
     * returns an user's inventory items
     * returns 200 if successful
     * returns 400 if the request is malformed
     * returns 404 if the user doesn't exist
     * returns 500 if an internal unknown error occured
     * @param req the request data
     * @param res the response data
     * @param next the next request handler
     */
    private static async onGetInventory(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const reqUserId = Number(req.params.userId)

        LogInstance.debug(`GET request to /inventory/${reqUserId}`)

        if (isNaN(reqUserId)) {
            return res.status(400).end()
        }

        try {
            const userInv: Inventory = await Inventory.getById(reqUserId)

            if (userInv != null) {
                return res.status(200).json(userInv).end()
            } else {
                return res.status(404).end()
            }
        } catch (error) {
            LogInstance.error(error)
            return res.status(500).end()
        }
    }

    /**
     * called when a POST request to /inventory/:userId is done
     * create an inventory for an user
     * returns 201 if created successfully
     * returns 400 if the request is malformed
     * returns 409 if the user already has an inventory
     * returns 500 if an internal unknown error occured
     * @param req the request data
     * @param res the response data
     * @param next the next request handler
     */
    private static async onPostInventory(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const reqUserId = Number(req.params.userId)

        if (isNaN(reqUserId)) {
            return res.status(400).end()
        }

        try {
            const newInventory: Inventory = await Inventory.create(reqUserId)
            return res.status(201).json(newInventory).end()
        } catch (error) {
            const postgresErr = ToPostgresError(error)
            if (postgresErr != null) {
                if (postgresErr.code === '23505') {
                    LogInstance.warn(
                        `Tried to create inventory for an existing user (${reqUserId})`
                    )
                    return res.status(409).end()
                }
            }
            LogInstance.error(error)
            return res.status(500).end()
        }
    }

    /**
     * called when a DELETE request to /inventory/:userId is done
     * deletes an user's invetory, cosmetics, loadouts and buy menu
     * returns 200 if deleted successfully
     * returns 400 if the request is malformed
     * returns 404 if the user doesn't exist
     * returns 500 if an internal unknown error occured
     * @param req the request data
     * @param res the response data
     * @param next the next request handler
     */
    private static async onDeleteInventory(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const reqUserId = Number(req.params.userId)

        LogInstance.debug(`DELETE request to /inventory/${reqUserId}`)

        if (isNaN(reqUserId)) {
            return res.status(400).end()
        }

        try {
            const wasDeleted: boolean = await Inventory.remove(reqUserId)
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

    /**
     * called when a PUT request to /inventory/:userId/item is done
     * adds an item to an user's inventory
     * returns 200 if added successfully
     * returns 400 if the request is malformed
     * returns 404 if the user doesn't exist
     * returns 500 if an internal unknown error occured
     * @param req the request data
     * @param res the response data
     * @param next the next request handler
     */
    private static async onPutInventoryItem(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        type putItemBody = {
            itemId: string
            ammount: string
        }

        const body = req.body as putItemBody

        const reqUserId = Number(req.params.userId)
        const reqItemId = Number(body.itemId)
        const reqItemAmmount = Number(body.ammount)

        LogInstance.debug(`PUT request to /inventory/${reqUserId}/item`)

        if (isNaN(reqUserId) || isNaN(reqItemId) || isNaN(reqItemAmmount)) {
            return res.status(400).end()
        }

        try {
            const wasAdded: boolean = await Inventory.addItem(
                reqItemId,
                reqItemAmmount,
                reqUserId
            )

            if (wasAdded === true) {
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
     * called when a DELETE request to /inventory/:userId/item is done
     * deletes an item from an user's invetory
     * returns 200 if deleted successfully
     * returns 400 if the request is malformed
     * returns 404 if the user doesn't exist
     * returns 500 if an internal unknown error occured
     * @param req the request data
     * @param res the response data
     * @param next the next request handler
     */
    private static async onDeleteInventoryItem(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        type deleteItemBody = {
            itemId: string
            ammount: string
        }

        const body = req.body as deleteItemBody

        const reqUserId = Number(req.params.userId)
        const reqItemId = Number(body.itemId)
        const reqItemAmmount = Number(body.ammount)

        LogInstance.debug(`DELETE request to /inventory/${reqUserId}/item`)

        if (
            isNaN(reqUserId) ||
            reqItemId == null ||
            (body.ammount != null && isNaN(reqItemAmmount))
        ) {
            return res.status(400).end()
        }

        try {
            const wasDeleted: boolean = await Inventory.removeItem(
                reqItemId,
                reqUserId,
                reqItemAmmount
            )
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
