import express from 'express'

import { LogInstance } from 'log/loginstance'

import { User } from 'entities/user'

import { UsersService } from 'services/usersservice'

import { WebSession, SessionRedirectError } from 'websession'
import { FORM_SECURITY_QUESTIONS } from 'securityquestions'

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
    app.route('/do_recover_pw').post(async (req, res) => {
      await ActionsController.OnPostDoRecoverPw(req, res)
    })
    app.route('/do_recover_pw2').post(async (req, res) => {
      await ActionsController.OnPostDoRecoverPwUpdate(req, res)
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
      security_question?: string
      security_answer?: string
      coolfield?: string // anti bot field
    }

    const typedBody = req.body as signupBody

    const userName = typedBody.username
    const playerName = typedBody.playername
    const password = typedBody.password
    const confirmedPassword = typedBody.confirmed_password
    const securityQuestion = Number(typedBody.security_question)
    const securityAnswer = typedBody.security_answer
    const antiBotField = typedBody.coolfield

    if (
      userName == null ||
      playerName == null ||
      password == null ||
      confirmedPassword == null ||
      isNaN(securityQuestion) === true ||
      securityAnswer == null ||
      antiBotField.length !== 0
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
        'The passwords do not match.',
        '/signup',
        req,
        res
      )
    }

    if (
      securityQuestion < 0 ||
      securityQuestion >= FORM_SECURITY_QUESTIONS.length
    ) {
      return SessionRedirectError(
        'An invalid security question was picked.',
        '/signup',
        req,
        res
      )
    }

    try {
      const newUser: User = await UsersService.create(
        userName,
        playerName,
        password,
        securityQuestion,
        securityAnswer
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
      coolfield?: string // anti bot field
    }

    const typedBody = req.body as loginBody

    const username: string = typedBody.username
    const password: string = typedBody.password
    const antiBotField: string = typedBody.coolfield

    if (username == null || password == null || antiBotField.length !== 0) {
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

  /**
   * called when a POST request to /do_recover_pw is done
   * checks for an user's security question
   * @param req the request data
   * @param res the response data
   */
  private static async OnPostDoRecoverPw(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const session = req.session as WebSession
    const body = req.body as {
      username: string
    }

    if (session.userId != null) {
      return res.redirect('/')
    }

    const username = body.username

    if (username == null) {
      return SessionRedirectError(
        'Please fill in all the required fields',
        '/recover_pw',
        req,
        res
      )
    }

    try {
      const user = await UsersService.getByName(username)

      if (user == null) {
        return SessionRedirectError(
          'The user does not exist.',
          '/recover_pw',
          req,
          res
        )
      }

      req.session.security_username = username
      req.session.security_question =
        FORM_SECURITY_QUESTIONS[user.security_question_index]

      req.session.save((err) => {
        if (err) {
          throw err
        }
      })

      return res.redirect('/recover_pw')
    } catch (error) {
      if (error) {
        const typedError = error as { toString: () => string }
        const errorMessage: string = typedError.toString()
        LogInstance.error(errorMessage)
        SessionRedirectError(errorMessage, '/recover_pw', req, res)
      }
    }
  }

  /**
   * called when a POST request to /do_recover_pw2 is done
   * update's an user's password
   * @param req the request data
   * @param res the response data
   */
  private static async OnPostDoRecoverPwUpdate(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const session = req.session as WebSession
    const body = req.body as {
      username: string
      security_answer: string
      password: string
      confirmed_password: string
    }

    if (session.userId != null) {
      return res.redirect('/')
    }

    const username = body.username
    const securityAnswer = body.security_answer
    const password = body.password
    const confirmedPassword = body.confirmed_password

    if (
      username == null ||
      securityAnswer == null ||
      password == null ||
      confirmedPassword == null
    ) {
      return SessionRedirectError(
        'Please fill in all the required fields',
        '/recover_pw',
        req,
        res
      )
    }

    if (password !== confirmedPassword) {
      return SessionRedirectError(
        'The passwords do not match.',
        '/recover_pw',
        req,
        res
      )
    }

    try {
      const targetUserId = await UsersService.validateSecurityAnswer(
        username,
        securityAnswer
      )

      if (targetUserId == null) {
        return SessionRedirectError(
          'The user name or the security answer are incorrect.',
          '/recover_pw',
          req,
          res
        )
      }

      const updated = await UsersService.updatePassword(targetUserId, password)

      if (updated === false) {
        return SessionRedirectError(
          'Failed to update the password.',
          '/recover_pw',
          req,
          res
        )
      }

      req.session.status = 'Password updated successfully.'

      req.session.save((err) => {
        if (err) {
          throw err
        }
      })

      return res.redirect('/login')
    } catch (error) {
      if (error) {
        const typedError = error as { toString: () => string }
        const errorMessage: string = typedError.toString()
        LogInstance.error(errorMessage)
        SessionRedirectError(errorMessage, '/recover_pw', req, res)
      }
    }
  }
}
