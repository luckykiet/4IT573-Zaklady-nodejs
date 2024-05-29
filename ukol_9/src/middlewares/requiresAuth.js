// @ts-check

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const requiresAuth = (req, res, next) => {
  if (res.locals.user) {
    next()
  } else {
    res.redirect("/register")
  }
}
