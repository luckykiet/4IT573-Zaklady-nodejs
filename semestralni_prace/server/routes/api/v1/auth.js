// @ts-nocheck
import { Router } from "express"
import passport from "passport"
import {
  login,
  registerUser,
  checkIsAuthenticated,
  signout,
} from "../../../controllers/v1/auth.js"
import bcrypt from "bcryptjs"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc.js"
import { Strategy as LocalStrategy } from "passport-local"
import Users from "../../../models/users.js"
import utils from "../../../utils.js"
dayjs.extend(utc)

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        email = email.toLowerCase()

        if (!email) {
          return done(null, null)
        }

        if (!utils.emailRegex.test(email)) {
          return done(null, false, {
            message: "srv_invalid_email",
          })
        }

        const user = await Users.findOne({
          email,
        })

        if (!user) {
          return done(null, false, {
            message: "srv_invalid_credentials",
          })
        }

        if (user.role !== "admin" && !user.isAvailable) {
          return done(null, false, {
            message: "srv_account_blocked",
          })
        }

        const isMatch = await bcrypt.compare(
          password,
          user.password
        )

        if (!isMatch) {
          return done(null, false, {
            message: "srv_invalid_credentials",
          })
        }

        return done(null, user)
      } catch (error) {
        console.error(error)
        return done(null, false, {
          message: "srv_failed_to_authorize",
        })
      }
    }
  )
)

passport.serializeUser((user, done) => {
  console.log("Passport serializeUser")
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  console.log("Passport deserializeUser")
  try {
    const user = await Users.findById(id)
    if (!user) {
      return done(null, false)
    }
    return done(null, user)
  } catch (err) {
    console.log(err)
    return done(err, null)
  }
})

export const router = Router()

router.post("/auth", passport.authenticate("local"), login)
router.post("/register", registerUser)
router.post("/isAuthenticated", checkIsAuthenticated)
router.get("/signout", signout)
