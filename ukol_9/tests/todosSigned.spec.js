import test from "ava"
import supertest from "supertest"
import { app } from "../src/app.js"
import { db } from "../src/db.js"

let agent

test.beforeEach(async () => {
  await db.migrate.latest()

  agent = supertest.agent(app)

  await agent
    .post("/register")
    .type("form")
    .send({ name: "admin", password: "admin" })
})

test.afterEach(async () => {
  await db.migrate.rollback()
})

test.serial("create new todo via form", async (t) => {
  const response = await agent
    .post("/add-todo")
    .type("form")
    .send({ title: "Nějaký název" })
    .redirects(1)

  t.assert(response.text.includes("Nějaký název"))
})

test.serial("update todo via form", async (t) => {
  await agent
    .post("/add-todo")
    .type("form")
    .send({ title: "Moje todo" })

  const response = await agent
    .post(`/update-todo/1`)
    .type("form")
    .send({ title: "Tvoje todo" })
    .redirects(1)

  t.assert(response.text.includes("Tvoje todo"))
})

test.serial("remove todo", async (t) => {
  await agent
    .post("/add-todo")
    .type("form")
    .send({ title: "Moje todo" })

  const response = await agent
    .get(`/remove-todo/1`)
    .redirects(1)

  t.assert(!response.text.includes("Moje todo"))
})

test.serial("toggle todo", async (t) => {
  const [todo] = await db("todos")
    .insert({
      title: "Moje todo",
    })
    .returning("*")

  const response = await agent
    .get(`/toggle-todo/${todo.id}`)
    .redirects(1)

  t.assert(response.text.includes("hotovo"))
})
