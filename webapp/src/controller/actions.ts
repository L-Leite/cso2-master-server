import express from 'express'

import { LogInstance } from 'log/loginstance'

import { User } from 'entities/user'

import { UsersService } from 'services/usersservice'

import { WebSession, SessionRedirectError } from 'websession'

/**
 * handles requests to /do_*
 */
export class ActionsController {
  /**
   * setup the controller's routes
   * @param app the server's express instance
   */
  public static setup(app: express.Express): void {
    app.route('/do_signup').post(async (req, res) => {
      await ActionsController.OnPostDoSignup(req, res)
    })
    app.route('/do_login').post(async (req, res) => {
      await ActionsController.OnPostDoLogin(req, res)
    })
    app.route('/do_delete').post(async (req, res) => {
      await ActionsController.OnPostDoDelete(req, res)
    })
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
      return SessionRedirectError(
        'A bad request was made.',
        '/signup',
        req,
        res
      )
    }

    if (password !== confirmedPassword) {
      return SessionRedirectError(
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
        SessionRedirectError(
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
          SessionRedirectError(
            'Internal error: could not create inventory for user',
            '/signup',
            req,
            res
          )
          return
        }
      }

      req.session.userId = newUser.id
      req.session.userName = newUser.playername
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
        SessionRedirectError(errorMessage, '/signup', req, res)
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
      return SessionRedirectError('A bad request was made.', '/login', req, res)
    }

    try {
      const authedUserId: number = await UsersService.validate(
        username,
        password
      )

      if (authedUserId) {
        const loggedUser = await UsersService.get(authedUserId)

        if (loggedUser == null) {
          throw new Error('Failed to get valid user data')
        }

        req.session.userId = authedUserId
        req.session.userName = loggedUser.playername
        req.session.save((err) => {
          if (err) {
            throw err
          }
        })

        return res.redirect('/user')
      }

      SessionRedirectError('Bad credentials', '/login', req, res)
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
        SessionRedirectError(errorMessage, '/login', req, res)
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
      return SessionRedirectError(
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

      SessionRedirectError('Failed to delete account.', '/user', req, res)
    } catch (error) {
      if (error) {
        const typedError = error as { toString: () => string }
        const errorMessage: string = typedError.toString()
        LogInstance.error(errorMessage)
        SessionRedirectError(errorMessage, '/signup', req, res)
      }
    }
  }
}
