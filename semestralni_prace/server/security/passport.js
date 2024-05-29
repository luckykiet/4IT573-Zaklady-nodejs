import passport from "passport"
import bcrypt from "bcryptjs"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc.js"
import { Strategy } from "passport-local"
dayjs.extend(utc)

const LocalStrategy = Strategy

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      username = username.toLowerCase()
      const subdomainAndUsername = username.split(":")
      if (subdomainAndUsername.length !== 2) {
        return done(null, null)
      }
      const subdomain = subdomainAndUsername[0]
      if (!utils.subdomainValidator.test(subdomain)) {
        return done(null, false, {
          message: "srv_invalid_subdomain",
        })
      }

      const merchant = await MerchantModel.findOne({
        subdomain,
      })

      if (!merchant) {
        return done(null, false, {
          message: "srv_merchant_not_found",
        })
      }

      const foundUser = await StaffModel.findOne({
        username: username,
        merchantId: merchant._id,
      })

      if (!foundUser) {
        return done(null, false, {
          message: "srv_invalid_credentials",
        })
      }

      const isMatch = await bcrypt.compare(
        password,
        foundUser.password
      )

      if (!isMatch) {
        return done(null, false, {
          message: "srv_invalid_credentials",
        })
      }

      return done(null, foundUser)
    } catch (error) {
      console.error(error)
      return done(null, false, {
        message: "srv_failed_to_authorize",
      })
    }
  })
)

passport.serializeUser((user, done) => {
  console.log("Passport serializeUser")
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  console.log("Passport deserializeUser")
  StaffModel.findById(id)
    .then((user) => {
      if (!user) {
        return done(null, false)
      }
    })
    .catch((err) => {
      console.log(err)
      return done(err, null)
    })
})
