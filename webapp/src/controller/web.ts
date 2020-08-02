import express from 'express'

import { LogInstance } from 'log/loginstance'

import { MapImageList } from 'maps'

import { User } from 'entities/user'
import { UsersService } from 'services/usersservice'

type WebSession = {
    error?: string
    status?: string
    userId?: number
}

/**
 * handles requests to /
 */
export class WebController {
    /**
     * setup the controller's routes
     * @param app the server's express instance
     */
    public static setup(app: express.Express): void {
        app.route('/').get(async (req, res) => {
            await WebController.OnGetIndex(req, res)
        })
        app.route('/signup').get((req, res) => {
            WebController.OnGetSignup(req, res)
        })
        app.route('/login').get((req, res) => {
            WebController.OnGetLogin(req, res)
        })
        app.route('/logout').get((req, res) => {
            WebController.OnGetLogout(req, res)
        })
        app.route('/user').get(async (req, res) => {
            await WebController.OnGetUser(req, res)
        })
        app.route('/user/delete').get(async (req, res) => {
            await WebController.OnGetUserDelete(req, res)
        })
        app.route('/do_signup').post(async (req, res) => {
            await WebController.OnPostDoSignup(req, res)
        })
        app.route('/do_login').post(async (req, res) => {
            await WebController.OnPostDoLogin(req, res)
        })
        app.route('/do_delete').post(async (req, res) => {
            await WebController.OnPostDoDelete(req, res)
        })
    }

    /**
     * redirect to a page with an error message set in the session
     * @param error the error message
     * @param redirPage the page to redirect the user to
     * @param req the user's request object
     * @param res the response object to the user
     */
    private static redirectWithError(
        error: string,
        redirPage: string,
        req: express.Request,
        res: express.Response
    ): void {
        req.session.error = error
        return res.redirect(redirPage)
    }

    /**
     * clean up an user's session status and error messages
     * @param req the user's request
     */
    private static cleanUpStatus(req: express.Request): void {
        req.session.status = null
        req.session.error = null
        req.session.save((err) => {
            if (err) {
                throw err
            }
        })
    }

    /**
     * called when a GET request to / is done
     * renders the index page
     * @param req the request data
     * @param res the response data
     */
    private static async OnGetIndex(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        if (req.session.userId != null) {
            return res.redirect('/user')
        }

        const session = req.session as WebSession
        const numSessions: number = await UsersService.getSessions()

        res.render('index', {
            playersOnline: numSessions,
            mapImage: MapImageList.getRandomFile(),
            status: session.status,
            error: session.error
        })

        WebController.cleanUpStatus(req)
    }

    /**
     * called when a GET request to /signup is done
     * renders the signup page
     * @param req the request data
     * @param res the response data
     */
    private static OnGetSignup(req: express.Request, res: express.Response) {
        if (req.session.userId != null) {
            return res.redirect('/user')
        }

        const session = req.session as WebSession

        res.render('signup', {
            mapImage: MapImageList.getRandomFile(),
            status: session.status,
            error: session.error
        })

        WebController.cleanUpStatus(req)
    }

    /**
     * called when a GET request to /login is done
     * renders the login page
     * @param req the request data
     * @param res the response data
     */
    private static OnGetLogin(req: express.Request, res: express.Response) {
        if (req.session.userId != null) {
            return res.redirect('/user')
        }

        const session = req.session as WebSession

        res.render('login', {
            mapImage: MapImageList.getRandomFile(),
            status: session.status,
            error: session.error
        })

        WebController.cleanUpStatus(req)
    }

    /**
     * called when a GET request to /logout is done
     * deletes the userId in session and redirects to the /login page
     * @param req the request data
     * @param res the response data
     */
    private static OnGetLogout(
        req: express.Request,
        res: express.Response
    ): void {
        if (req.session.userId != null) {
            req.session.userId = null
        }

        req.session.status = 'Logged out succesfully.'

        req.session.save((err) => {
            if (err) {
                throw err
            }
        })

        res.redirect('/user')
    }

    /**
     * called when a GET request to /user is done
     * renders the user's info page
     * @param req the request data
     * @param res the response data
     */
    private static async OnGetUser(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        if (req.session.userId == null) {
            return res.redirect('/login')
        }

        const session = req.session as WebSession
        const user: User = await UsersService.get(req.session.userId)

        res.render('user', {
            user,
            mapImage: MapImageList.getRandomFile(),
            status: session.status,
            error: session.error
        })

        WebController.cleanUpStatus(req)
    }

    /**
     * called when a GET request to /user/delete is done
     * renders the user's info page
     * @param req the request data
     * @param res the response data
     */
    private static async OnGetUserDelete(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        if (req.session.userId == null) {
            return res.redirect('/login')
        }

        const session = req.session as WebSession
        const user: User = await UsersService.get(req.session.userId)

        res.render('delete', {
            user,
            mapImage: MapImageList.getRandomFile(),
            status: session.status,
            error: session.error
        })

        WebController.cleanUpStatus(req)
    }

    /**
     * called when a POST request to /do_signup is done
     * creates a new user account
     * @param req the request data
     * @param res the response data
     */
    private static async OnPostDoSignup(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        if (req.session.userId != null) {
            return res.redirect('/user')
        }

        type signupBody = {
            username?: string
            playername?: string
            password?: string
            confirmed_password?: string
        }

        const typedBody = req.body as signupBody

        const userName: string = typedBody.username
        const playerName: string = typedBody.playername
        const password: string = typedBody.password
        const confirmedPassword: string = typedBody.confirmed_password

        if (
            userName == null ||
            playerName == null ||
            password == null ||
            confirmedPassword == null
        ) {
            return WebController.redirectWithError(
                'A bad request was made.',
                '/signup',
                req,
                res
            )
        }

        if (password !== confirmedPassword) {
            return WebController.redirectWithError(
                'The passwords are not the same.',
                '/signup',
                req,
                res
            )
        }

        try {
            const newUser: User = await UsersService.create(
                userName,
                playerName,
                password
            )

            if (newUser == null) {
                WebController.redirectWithError(
                    'Invalid new user credentials',
                    '/signup',
                    req,
                    res
                )
                return
            }

            const results: boolean[] = await Promise.all([
                UsersService.createInventory(newUser.id),
                UsersService.createCosmetics(newUser.id),
                UsersService.createLoadouts(newUser.id),
                UsersService.createBuymenu(newUser.id)
            ])

            for (const r of results) {
                if (r === false) {
                    WebController.redirectWithError(
                        'Internal error: could not create inventory for user',
                        '/signup',
                        req,
                        res
                    )
                    return
                }
            }

            req.session.userId = newUser.id
            req.session.save((err) => {
                if (err) {
                    throw err
                }
            })

            return res.redirect('/user')
        } catch (error) {
            if (error) {
                const typedError = error as { toString: () => string }
                const errorMessage: string = typedError.toString()
                LogInstance.error(errorMessage)
                WebController.redirectWithError(
                    errorMessage,
                    '/signup',
                    req,
                    res
                )
            }
        }
    }

    /**
     * called when a POST request to /do_login is done
     * logs in to an user's account
     * @param req the request data
     * @param res the response data
     */
    private static async OnPostDoLogin(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        if (req.session.userId != null) {
            return res.redirect('/user')
        }

        type loginBody = {
            username?: string
            password?: string
        }

        const typedBody = req.body as loginBody

        const username: string = typedBody.username
        const password: string = typedBody.password

        if (username == null || password == null) {
            return WebController.redirectWithError(
                'A bad request was made.',
                '/login',
                req,
                res
            )
        }

        try {
            const authedUserId: number = await UsersService.validate(
                username,
                password
            )

            if (authedUserId) {
                req.session.userId = authedUserId
                req.session.save((err) => {
                    if (err) {
                        throw err
                    }
                })

                return res.redirect('/user')
            }

            WebController.redirectWithError(
                'Bad credentials',
                '/login',
                req,
                res
            )
        } catch (error) {
            if (error) {
                let errorMessage: string = null

                const typedError = error as {
                    status: number
                    toString: () => string
                }

                if (typedError.status === 404) {
                    errorMessage = 'User was not found'
                } else {
                    errorMessage = typedError.toString()
                }

                LogInstance.error(errorMessage)
                WebController.redirectWithError(
                    errorMessage,
                    '/login',
                    req,
                    res
                )
            }
        }
    }

    /**
     * called when a POST request to /do_delete is done
     * delete's an user's account
     * @param req the request data
     * @param res the response data
     */
    private static async OnPostDoDelete(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const session = req.session as WebSession
        const typedBody = req.body as { confirmation: string }

        const targetUserId: number = session.userId

        if (targetUserId == null) {
            return res.redirect('/login')
        }

        const confirmation: string = typedBody.confirmation

        if (confirmation !== 'on') {
            return WebController.redirectWithError(
                'The user did not tick the confirmation box',
                '/user/delete',
                req,
                res
            )
        }

        try {
            const deleted: boolean = await UsersService.delete(targetUserId)

            if (deleted) {
                req.session.userId = null
                req.session.status = 'Account deleted successfully.'

                req.session.save((err) => {
                    if (err) {
                        throw err
                    }
                })

                return res.redirect('/login')
            }

            WebController.redirectWithError(
                'Failed to delete account.',
                '/user',
                req,
                res
            )
        } catch (error) {
            if (error) {
                const typedError = error as { toString: () => string }
                const errorMessage: string = typedError.toString()
                LogInstance.error(errorMessage)
                WebController.redirectWithError(
                    errorMessage,
                    '/signup',
                    req,
                    res
                )
            }
        }
    }
}
