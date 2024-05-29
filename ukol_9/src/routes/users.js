import { Router } from "express"
import { createUser, getUser } from "../users.js"

export const usersRouter = new Router()

usersRouter.get("/register", async (req, res) => {
  res.render("register")
})

usersRouter.post("/register", async (req, res) => {
  const user = await createUser(
    req.body.name,
    req.body.password
  )

  if (!user) return res.redirect("/register")

  res.cookie("token", user.token)

  res.redirect("/")
})

usersRouter.get("/login", async (req, res) => {
  res.render("login")
})

usersRouter.post("/login", async (req, res) => {
  const user = await getUser(
    req.body.name,
    req.body.password
  )

  if (!user) return res.redirect("/login")

  res.cookie("token", user.token)

  res.redirect("/")
})

usersRouter.get("/logout", (req, res) => {
  res.clearCookie("token")

  res.redirect("back")
})
