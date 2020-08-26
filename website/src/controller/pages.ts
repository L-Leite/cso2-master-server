import express from 'express'

import { UsersService } from 'services/usersservice'
import { InventoryService } from 'services/inventoryservice'

import { MapImageList } from 'maps'
import { FORM_SECURITY_QUESTIONS } from 'securityquestions'
import { WebSession } from 'websession'

/**
 * handles requests to pages
 */
export class PagesController {
  /**
   * setup the controller's routes
   * @param app the server's express instance
   */
  public static setup(app: express.Express): void {
    app.route('/').get(async (req, res) => {
      await PagesController.OnGetIndex(req, res)
    })
    app.route('/signup').get(async (req, res) => {
      await PagesController.OnGetSignup(req, res)
    })
    app.route('/login').get(async (req, res) => {
      await PagesController.OnGetLogin(req, res)
    })
    app.route('/logout').get((req, res) => {
      PagesController.OnGetLogout(req, res)
    })
    app.route('/user').get(async (req, res) => {
      await PagesController.OnGetUser(req, res)
    })
    app.route('/user/delete').get(async (req, res) => {
      await PagesController.OnGetUserDelete(req, res)
    })
    app.route('/recover_pw').get(async (req, res) => {
      await PagesController.OnGetRecoverPw(req, res)
    })
    app.route('/about').get(async (req, res) => {
      await PagesController.OnGetAbout(req, res)
    })
    app.route('/downloads').get(async (req, res) => {
      await PagesController.OnGetDownloads(req, res)
    })
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
    const session = req.session as WebSession
    const numSessions: number = await UsersService.getSessions()

    res.render('index', {
      playersOnline: numSessions,
      mapImage: MapImageList.getRandomFile(),
      session
    })

    PagesController.cleanUpStatus(req)
  }

  /**
   * called when a GET request to /signup is done
   * renders the signup page
   * @param req the request data
   * @param res the response data
   */
  private static async OnGetSignup(
    req: express.Request,
    res: express.Response
  ) {
    if (req.session.userId != null) {
      return res.redirect('/user')
    }

    const session = req.session as WebSession
    const numSessions: number = await UsersService.getSessions()

    res.render('signup', {
      playersOnline: numSessions,
      mapImage: MapImageList.getRandomFile(),
      session,
      questions: FORM_SECURITY_QUESTIONS
    })

    PagesController.cleanUpStatus(req)
  }

  /**
   * called when a GET request to /login is done
   * renders the login page
   * @param req the request data
   * @param res the response data
   */
  private static async OnGetLogin(req: express.Request, res: express.Response) {
    if (req.session.userId != null) {
      return res.redirect('/user')
    }

    const session = req.session as WebSession
    const numSessions: number = await UsersService.getSessions()

    res.render('login', {
      playersOnline: numSessions,
      mapImage: MapImageList.getRandomFile(),
      session
    })

    PagesController.cleanUpStatus(req)
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
    const [user, cosmetics, numSessions] = await Promise.all([
      UsersService.get(req.session.userId),
      InventoryService.GetCosmetics(req.session.userId),
      UsersService.getSessions()
    ])

    res.render('user', {
      user,
      cosmetics,
      playersOnline: numSessions,
      mapImage: MapImageList.getRandomFile(),
      session
    })

    PagesController.cleanUpStatus(req)
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
    const [user, numSessions] = await Promise.all([
      UsersService.get(req.session.userId),
      UsersService.getSessions()
    ])

    res.render('delete', {
      user,
      playersOnline: numSessions,
      mapImage: MapImageList.getRandomFile(),
      session
    })

    PagesController.cleanUpStatus(req)
  }

  /**
   * called when a GET request to /recover_pw is done
   * renders the recover password page
   * @param req the request data
   * @param res the response data
   */
  private static async OnGetRecoverPw(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    if (req.session.userId != null) {
      return res.redirect('/')
    }

    const session = req.session as WebSession
    const numSessions = await UsersService.getSessions()

    res.render('recover_pw', {
      playersOnline: numSessions,
      mapImage: MapImageList.getRandomFile(),
      session
    })

    PagesController.cleanUpStatus(req)
  }

  /**
   * called when a GET request to /about is done
   * renders the about page
   * @param req the request data
   * @param res the response data
   */
  private static async OnGetAbout(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const session = req.session as WebSession
    const numSessions: number = await UsersService.getSessions()

    res.render('about', {
      playersOnline: numSessions,
      mapImage: MapImageList.getRandomFile(),
      session
    })

    PagesController.cleanUpStatus(req)
  }

  /**
   * called when a GET request to /downloads is done
   * renders the downloads page
   * @param req the request data
   * @param res the response data
   */
  private static async OnGetDownloads(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const session = req.session as WebSession
    const numSessions: number = await UsersService.getSessions()

    res.render('downloads', {
      playersOnline: numSessions,
      mapImage: MapImageList.getRandomFile(),
      session
    })

    PagesController.cleanUpStatus(req)
  }
}
