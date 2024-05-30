// @ts-nocheck

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.sendStatus(401)
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const adminOnly = (req, res, next) => {
  if (req.user.role === "admin") {
    next()
  } else {
    res.sendStatus(403)
  }
}
