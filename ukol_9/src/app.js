import cookieParser from "cookie-parser"
import express from "express"
import expressEjsLayouts from "express-ejs-layouts"
import { getAllTodos } from "./db.js"
import { loadUserFromCookie } from "./middlewares/loadUserFromCookie.js"
import { todosApi } from "./api/todos.js"
import { todosRouter } from "./routes/todos.js"
import { usersRouter } from "./routes/users.js"

export const app = express()

app.use(expressEjsLayouts)

app.set("layout", "layouts/default-layout")
app.set("view engine", "ejs")

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(loadUserFromCookie)

app.get("/", async (req, res) => {
  const todos = await getAllTodos({
    returnOnlyIncomplete: req.query.show === "incomplete",
  })

  res.render("index", {
    title: "Todos",
    todos,
  })
})

app.use(todosRouter)
app.use(usersRouter)

app.use("/api", todosApi)

app.use((req, res) => {
  res.status(404)
  res.send("404 - Stránka nenalezena")
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500)
  res.send("500 - Chyba na straně serveru")
})
