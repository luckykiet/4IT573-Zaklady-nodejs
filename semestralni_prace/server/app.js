//@ts-check
import * as dotenv from "dotenv"
import {
  errorLogger,
  errorResponder,
} from "./errors_handler.js"
import bodyParser from "body-parser"
import compression, { filter as _filter } from "compression"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import session from "express-session"
import logger from "morgan"
import passport from "passport"
import { join, dirname } from "path"
import { default as connectMongoDBSession } from "connect-mongodb-session"
import { CONFIG } from "./config/config.js"
import { fileURLToPath } from "url"
import { router as pingRouter } from "./routes/api/v1/ping.js"
import { router as storeRouter } from "./routes/api/v1/stores.js"
import { router as authRouter } from "./routes/api/v1/auth.js"

import Database from "./db/index.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config()
const MongoDBStore = connectMongoDBSession(session)

if (
  process.env.NODE_ENV === "DEV" ||
  process.env.NODE_ENV === "PRODUCTION"
) {
  Database.getInstance()
}

const store = new MongoDBStore({
  uri: CONFIG.MONGODB_URI,
  collection: "sessions",
  connectionOptions: {
    serverSelectionTimeoutMS: 10000,
  },
})

store.on("error", function (error) {
  console.log(error)
})

const app = express()

app.use(logger("dev"))
app.use(cookieParser())
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false
      }
      return _filter(req, res)
    },
    level: 6,
    threshold: 10 * 1000,
  })
)

app.use(bodyParser.json({ limit: "20mb" }))
app.use(
  bodyParser.urlencoded({ extended: false, limit: "20mb" })
)

const corsWhitelist = [
  /^https:\/\/[a-z0-9]+\.vcap\.me:3000$/,
  /^https:\/\/[a-z0-9]+\.vcap\.me:5173$/,
]

/**
 *
 * @type {import('cors').CorsOptions}
 */
const corsOptions = {
  /**
   * @param {string | undefined} origin
   * @param {(err: Error | null, origin?: boolean | string | RegExp | Array<boolean | string | RegExp>) => void} callback
   */
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true)
    }
    for (const pattern of corsWhitelist) {
      if (pattern.test(origin)) {
        return callback(null, true)
      }
    }
    callback(new Error(`${origin} Not allowed by CORS`))
  },
  credentials: true,
}

app.use(cors(corsOptions))
app.use(express.static(join(__dirname, "public")))

app.use(
  session({
    secret: "thisCommanddoesliter@llYnothing",
    store: store,
    cookie: { maxAge: 2 * 60 * 60 * 1000, sameSite: "lax" }, // persistent cookie for 10 years in miliseconds
    // cookie: { sameSite: "none", secure: true },
    // if not set the cookies will not be saved in the browser after closing it
    resave: true, // Forces the session to be saved back to the session store,
    // even if the session was never modified during the request.
    saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store.
    // A session is uninitialized when it is new but not modified.
  })
)

app.use(passport.initialize())
app.use(passport.session())

const apiPrefix = "/api/v1"

app.use(apiPrefix, pingRouter)
app.use(apiPrefix, authRouter)
app.use(apiPrefix, storeRouter)

app.get(
  "*",
  /**
   * @param {Error} err
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  (err, req, res, next) => {
    if (err) {
      return next(err)
    }
    return res.sendFile(
      join(__dirname, "public", "index.html")
    )
  }
)

// catch 404 and forward to error handler
app.use(errorLogger)
app.use(errorResponder)

export default app
