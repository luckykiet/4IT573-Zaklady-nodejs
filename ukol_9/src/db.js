import knex from "knex"
import knexfile from "../knexfile.js"

const env = process.env.NODE_ENV ?? "development"

export const db = knex(knexfile[env])

export const getAllTodos = async (options) => {
  const query = db("todos").select("*")

  if (options && options.returnOnlyIncomplete) {
    query.where("done", "=", false)
  }

  const todos = await query

  return todos
}

export const getTodoById = async (id) => {
  const todo = await db("todos")
    .select("*")
    .where("id", id)
    .first()

  return todo
}
