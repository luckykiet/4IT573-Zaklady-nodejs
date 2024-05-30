// @ts-nocheck
import { Router } from "express"
import passport from "passport"
import {
  login,
  registerUser,
  checkIsAuthenticated,
  signout,
} from "../../../controllers/v1/auth.js"
export const router = Router()

router.post("/auth", passport.authenticate("local"), login)
router.post("/registration", registerUser)
router.post("/isAuthenticated", checkIsAuthenticated)
router.get("/signout", signout)
