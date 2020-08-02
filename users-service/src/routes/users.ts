import express from 'express'

import { LogInstance } from 'log/loginstance'

import { User } from 'entities/user'
import { SessionCounter } from 'sessioncounter'

/**
 * handles requests to /users
 */
export class UsersRoute {
    public static InstallRoutes(app: express.Express): void {
        app.route('/users')
            .get(
                async (req: express.Request, res: express.Response) =>
                    await UsersRoute.onGetAllUsers(req, res)
            )
            .post(
                async (req: express.Request, res: express.Response) =>
                    await UsersRoute.onPostUsers(req, res)
            )
        app.route('/users/:userId')
            .get(
                async (req: express.Request, res: express.Response) =>
                    await UsersRoute.onGetUsersById(req, res)
            )
            .put(
                async (req: express.Request, res: express.Response) =>
                    await UsersRoute.onPutUsersById(req, res)
            )
            .delete(
                async (req: express.Request, res: express.Response) =>
                    await UsersRoute.onDeleteUserById(req, res)
            )
        app.route('/users/auth/login').post(
            async (req: express.Request, res: express.Response) =>
                await UsersRoute.onPostLogin(req, res)
        )
        app.route(
            '/users/auth/logout'
        ).post((req: express.Request, res: express.Response) =>
            UsersRoute.onPostLogout(req, res)
        )
        app.route('/users/auth/validate').post(
            async (req: express.Request, res: express.Response) =>
                await UsersRoute.onPostValidate(req, res)
        )
        app.route('/users/byname/:username').get(
            async (req: express.Request, res: express.Response) =>
                await UsersRoute.onGetUsersByName(req, res)
        )
    }

    /**
     * called when a GET request to /users is done
     * returns every user by page
     * returns 200 if successful
     * returns 400 if the request is malformed
     * returns 413 if the requested page is too large
     * returns 500 if an internal error occured
     * @param req the request data
     * @param res the response data
     */
    private static async onGetAllUsers(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        type getUsersQuery = {
            offset: string
            length: string
        }

        const query = req.query as getUsersQuery

        const colOffset = Number(query.offset)
        const colLength = Number(query.length)

        if (isNaN(colOffset) === true || isNaN(colLength) === true) {
            return res.status(400).end()
        }

        const MAX_COLUMN_LENGTH = 100

        if (colLength > MAX_COLUMN_LENGTH) {
            return res.status(413).end()
        }

        try {
            const users: User[] = await User.getAll(colOffset, colLength)

            // return OK
            return res.status(200).json(users).end()
        } catch (error) {
            LogInstance.error(error)
            return res.status(500).end()
        }
    }

    /**
     * called when a POST request to /users is done
     * creates a new user
     * returns 201 if the user was created with the new user data
     * returns 400 if the request is malformed
     * returns 409 if the user already exists
     * returns 500 if an internal error occured
     * @param req the request data
     * @param res the response data
     */
    private static async onPostUsers(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        type postUsersBody = {
            username: string
            playername: string
            password: string
        }

        const body = req.body as postUsersBody

        const userName: string = body.username
        const playerName: string = body.playername
        const password: string = body.password

        if (userName == null || playerName == null || password == null) {
            return res.status(400).end()
        }

        try {
            const userExists: boolean = await User.isTaken(userName, playerName)

            if (userExists === true) {
                LogInstance.warn(
                    'Tried to create an existing user ' +
                        userName +
                        ' (' +
                        playerName +
                        ')'
                )
                return res.status(409).end()
            }

            const newUser: User = await User.create(
                userName,
                playerName,
                password
            )

            return res.status(201).json(newUser).end()
        } catch (error) {
            LogInstance.error(error)
            return res.status(500).end()
        }
    }

    /**
     * called when a GET request to /users/:userId is done
     * returns an user's information
     * returns 200 if successful
     * returns 400 if the request is malformed
     * returns 404 if the user cannot be found
     * returns 500 if an internal error occured
     * @param req the request data
     * @param res the response data
     */
    private static async onGetUsersById(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const reqUserId = Number(req.params.userId)

        // return bad request if the userId isn't a number
        if (isNaN(reqUserId)) {
            return res.status(400).end()
        }

        try {
            const user: User = await User.getById(reqUserId)

            // if the user isn't found
            if (user == null) {
                return res.status(404).end()
            }

            // return OK
            return res.status(200).json(user).end()
        } catch (error) {
            LogInstance.error(error)
            return res.status(500).end()
        }
    }

    /**
     * called when a PUT request to /users/:userId is done
     * updates an user's data
     * returns 200 if the data was updated successfully
     * returns 400 if the request is malformed
     * returns 404 if the user wasn't found
     * returns 500 if an internal error occured
     * @param req the request data
     * @param res the response data
     */
    private static async onPutUsersById(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const reqUserId = Number(req.params.userId)

        if (isNaN(reqUserId) || req.body == null) {
            return res.status(400).end()
        }

        try {
            const wasUpdated: boolean = await User.set(reqUserId, req.body)

            if (wasUpdated) {
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
     * called when a DELETE request to /users/:userId is done
     * deletes an user by its userId
     * returns 200 if successful
     * returns 400 if the request is malformed
     * returns 404 if the user cannot be found
     * returns 500 if an internal error occured
     * @param req the request data
     * @param res the response data
     */
    private static async onDeleteUserById(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const reqUserId = Number(req.params.userId)

        // return bad request if the userId isn't a number
        if (isNaN(reqUserId)) {
            return res.status(400).end()
        }

        try {
            const deleted: boolean = await User.removeById(reqUserId)

            if (deleted === true) {
                // return OK
                return res.status(200).end()
            } else {
                // if the user isn't found
                return res.status(404).end()
            }
        } catch (error) {
            LogInstance.error(error)
            return res.status(500).end()
        }
    }

    /**
     * called when a POST request to /users/auth/login is done
     * checks if the user credentials are valid
     * returns 200 if the credentials are valid
     * returns 400 if the request is malformed
     * returns 401 if the credentials are invalid
     * returns 500 if an internal error occured
     * @param req the request data
     * @param res the response data
     */
    private static async onPostLogin(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        type postUsersBody = {
            username: string
            password: string
        }

        const body = req.body as postUsersBody

        const userName: string = body.username
        const password: string = body.password

        if (userName == null || password == null) {
            return res.status(400).end()
        }

        try {
            const loggedUserId: number = await User.validateCredentials(
                userName,
                password
            )

            if (loggedUserId != null) {
                SessionCounter.Increment()
                return res.status(200).json({ userId: loggedUserId }).end()
            } else {
                return res.status(401).end()
            }
        } catch (error) {
            LogInstance.error(error)
            return res.status(500).end()
        }
    }

    /**
     * called when a POST request to /users/auth/logout is done
     * logs an user out
     * returns 200 if the user was logged out
     * returns 400 if the request is malformed
     * returns 404 if the use does not exist
     * returns 500 if an internal error occured
     * @param req the request data
     * @param res the response data
     */
    private static onPostLogout(
        req: express.Request,
        res: express.Response
    ): void {
        type postLogoutBody = {
            userId: string
        }

        const body = req.body as postLogoutBody

        const userId: string = body.userId

        if (userId == null) {
            return res.status(400).end()
        }

        try {
            // TODO: do anything with this maybe?
            SessionCounter.Decrement()
            return res.status(200).json().end()
        } catch (error) {
            LogInstance.error(error)
            return res.status(500).end()
        }
    }

    /**
     * called when a POST request to /users/auth/validate is done
     * checks if these credentials are valid
     * returns 200 if the they are
     * returns 400 if the request is malformed
     * returns 401 if the credentials are invalid
     * returns 500 if an internal error occured
     * @param req the request data
     * @param res the response data
     */
    private static async onPostValidate(
        req: express.Request,
        res: express.Response
    ) {
        type validateBody = {
            username: string
            password: string
        }

        const body = req.body as validateBody

        const username: string = body.username
        const password: string = body.password

        if (username == null || password == null) {
            return res.status(400).end()
        }

        try {
            const foundUserId = await User.validateCredentials(
                username,
                password
            )

            if (foundUserId == null) {
                return res.status(401).json().end()
            }

            return res.status(200).json({ userId: foundUserId }).end()
        } catch (error) {
            LogInstance.error(error)
            return res.status(500).end()
        }
    }

    /**
     * called when a GET request to /users/byname/:username is done
     * returns an user's information by their username
     * returns 200 if successful
     * returns 400 if the request is malformed
     * returns 404 if the user cannot be found
     * returns 500 if an internal error occured
     * @param req the request data
     * @param res the response data
     */
    private static async onGetUsersByName(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const reqUsername: string = req.params.username

        // return bad request if the userId isn't a number
        if (reqUsername == null) {
            return res.status(400).end()
        }

        try {
            const user: User = await User.getByName(reqUsername)

            // if the user isn't found
            if (user == null) {
                return res.status(404).end()
            }

            // return OK
            return res.status(200).json(user).end()
        } catch (error) {
            LogInstance.error(error)
            return res.status(500).end()
        }
    }
}
