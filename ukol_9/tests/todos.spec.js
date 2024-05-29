import test from "ava"
import supertest from "supertest"
import { app } from "../src/app.js"
import { db } from "../src/db.js"

test.beforeEach(async () => {
  await db.migrate.latest()
})

test.afterEach(async () => {
  await db.migrate.rollback()
})

test.serial("it renders a list of todos", async (t) => {
  const response = await supertest.agent(app).get("/")

  t.assert(response.text.includes("<h1>Todos</h1>"))
})

test.serial("create new todo", async (t) => {
  await db("todos").insert({
    title: "Moje todo",
  })

  const response = await supertest.agent(app).get("/")

  t.assert(response.text.includes("Moje todo"))
})

test.serial("todo detail", async (t) => {
  const [todo] = await db("todos")
    .insert({
      title: "Moje todo",
    })
    .returning("*")

  const response = await supertest
    .agent(app)
    .get(`/todo/${todo.id}`)

  t.assert(response.text.includes("Moje todo"))
})

test.serial("404 page", async (t) => {
  const response = await supertest
    .agent(app)
    .get("/todo/9001")

  t.is(response.status, 404)
  t.assert(
    response.text.includes("404 - Stránka nenalezena")
  )
})
