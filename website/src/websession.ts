import express from 'express'

export type WebSession = {
  error?: string
  status?: string
  userId?: number
  userName?: string
  security_username?: string
  security_question?: string
}

export function SessionRedirectError(
  error: string,
  redirPage: string,
  req: express.Request,
  res: express.Response
): void {
  req.session.error = error
  return res.redirect(redirPage)
}
