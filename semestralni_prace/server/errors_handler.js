// @ts-nocheck
import { unlink } from "fs"
import _ from "lodash"

/**
 * Middleware for logging errors to the console.
 *
 * @param {Error} err - The error object.
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 * @param {import("express").NextFunction} next - The Express next middleware function.
 */
export const errorLogger = (err, req, res, next) => {
  console.log(
    "\x1b[31m",
    err.code ? `${err.code} ${err.message}` : err.message
  )
  next(err)
}

/**
 * Middleware for responding to errors.
 *
 * @param {import('mongoose').Error} err - The error object.
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 * @param {import("express").NextFunction} next - The Express next middleware function.
 */
export const errorResponder = (err, req, res, next) => {
  if (req.file) {
    unlink(req.file.path, (err) => {
      if (err) {
        console.log(err)
      }
    })
  }

  if (res.headersSent) {
    return next(err)
  }

  res.header("Content-Type", "application/json")

  if (
    err.name === "ValidationError" ||
    err.name === "ValidatorError"
  ) {
    res.status(422).json({
      success: false,
      msg: Object.keys(err.errors).reduce((errors, key) => {
        errors[key] = "srv_validation_error"
        return errors
      }, {}),
    })
  } else if (err.code === 11000) {
    res.status(409).json({
      success: false,
      msg: "srv_error",
    })
  } else {
    try {
      res.status(err.code || 500).send({
        success: false,
        msg: err.message
          ? JSON.parse(err.message)
          : "An unknown error occurred!",
      })
    } catch (parseError) {
      res.status(500).send({
        success: false,
        msg: "An unknown error occurred!",
      })
    }
  }
}
