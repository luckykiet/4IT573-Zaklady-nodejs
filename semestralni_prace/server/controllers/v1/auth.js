// @ts-nocheck
import HttpError from "../../http-error.js"
import utils from "../../utils.js"
import { ROLES } from "../../config/roles.js"

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const registerUser = (req, res, next) => {
  try {
    
    const validator = {
      email: utils.emailRegex,
      password: /^.{6,128}$/,
      name: /^.{3,100}$/,
      role: utils.createEnumRegex(ROLES),
    };
    if (!utils.isValidRequest(validator, req.body)) {
      return res.json({ success: false, msg: 'srv_invalid_request' });
    }
    const { email, name, password } = req.body
    if (notAllowedUsernames.includes(username)) {
      return next(new HttpError('srv_duplicate', 409))
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new UserModel({
      username,
      email,
      name,
      password: hashedPassword,
    })
    await newUser.save()

    req.login(newUser, function (err) {
      if (err) {
        return next(new HttpError('srv_log_in_failed', 500))
      }

      const token = utils.signItemToken({
        isAuthenticated: true,
        username: req.user.username,
        name: req.user.name,
        role: req.user.role,
        expires: req.session.cookie.expires,
      })

      return res.status(200).json({
        success: true,
        token,
      })
    })
  } catch (error) {
    console.log(error)
    return next(new HttpError('srv_register_failed', 500))
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const login = (req, res) => {
  return res.json({
    isAuthenticated: req.isAuthenticated(),
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
  })
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const checkIsAuthenticated = (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.json({ isAuthenticated: false })
    }
    return res.json({
      isAuthenticated: req.isAuthenticated(),
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    })
  } catch (error) {
    console.error(error)
    return res.json({ isAuthenticated: false, msg: error })
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const signout = (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.json({ isAuthenticated: false })
    }
    req.logout((err) => {
      if (err) {
        return next(err)
      }
      req.session.destroy(() => {
        res.json({ success: true })
      })
    })
  } catch (error) {
    console.error(error)
    return res.json({ isAuthenticated: false, msg: error })
  }
}
