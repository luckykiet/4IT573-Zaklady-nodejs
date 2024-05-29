import { Router } from "express"
import { getTodoById } from "../db.js"

export const todosApi = new Router()

todosApi.get("/todo/:id", async (req, res) => {
  const id = req.params.id
  const todo = await getTodoById(id)
  res.send(todo)
})
