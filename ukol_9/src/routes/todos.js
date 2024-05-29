// @ts-check

import { db, getTodoById } from "../db.js"
import {
  sendTodoDeletedToAllConnections,
  sendTodoDetailToAllConnections,
  sendTodoListToAllConnections,
} from "../websockets.js"

import { Router } from "express"
import { checkThatTodoBelongsToCurentUser } from "../middlewares/checkThatTodoBelongsToCurentUser.js"
import { requiresAuth } from "../middlewares/requiresAuth.js"

export const todosRouter = new Router()

todosRouter.get("/todo/:id", async (req, res, next) => {
  const todo = await getTodoById(req.params.id)

  if (!todo) return next()

  res.render("todo", {
    todo,
  })
})

todosRouter.post(
  "/add-todo",
  requiresAuth,
  async (req, res) => {
    const todo = {
      title: req.body.title,
      done: false,
      user_id: res.locals.user.id,
    }

    await db("todos").insert(todo)

    res.redirect("/")
  }
)

todosRouter.post(
  "/update-todo/:id",
  requiresAuth,
  checkThatTodoBelongsToCurentUser,
  async (req, res, next) => {
    const todo = await getTodoById(req.params.id)
    if (!todo) return next()

    const query = db("todos").where("id", todo.id)

    if (req.body.title) {
      query.update({ title: req.body.title })
    }

    if (req.body.priority) {
      query.update({ priority: req.body.priority })
    }

    await query

    sendTodoListToAllConnections()
    sendTodoDetailToAllConnections(todo.id)

    res.redirect("back")
  }
)

todosRouter.get(
  "/remove-todo/:id",
  requiresAuth,
  checkThatTodoBelongsToCurentUser,
  async (req, res, next) => {
    const todo = await getTodoById(req.params.id)

    if (!todo) return next()

    await db("todos").delete().where("id", todo.id)

    sendTodoListToAllConnections()
    sendTodoDeletedToAllConnections(todo.id)

    res.redirect("/")
  }
)

todosRouter.get(
  "/toggle-todo/:id",
  requiresAuth,
  checkThatTodoBelongsToCurentUser,
  async (req, res, next) => {
    const todo = await getTodoById(req.params.id)

    if (!todo) return next()

    await db("todos")
      .update({ done: !todo.done })
      .where("id", todo.id)

    sendTodoListToAllConnections()
    sendTodoDetailToAllConnections(todo.id)

    res.redirect("back")
  }
)
