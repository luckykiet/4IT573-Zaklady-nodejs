import test from "ava"
import supertest from "supertest"
import { app } from "../src/app.js"
import { db } from "../src/db.js"
import {
  createUser,
  getUser,
  getUserByToken,
} from "../src/users.js"

test.beforeEach(async () => {
  await db.migrate.latest()
})

test.afterEach(async () => {
  await db.migrate.rollback()
})

test.serial("createUser creates user", async (t) => {
  const user = await createUser("adam", "heslo")
  t.not(user.hash, "heslo")
})

test.serial("getUser returns users", async (t) => {
  const user = await createUser("adam", "heslo")
  t.deepEqual(await getUser("adam", "heslo"), user)
  t.is(await getUser("adam", "password"), null)
  t.is(await getUser("franta", "heslo"), null)
})

test.serial("getUserByToken returns users", async (t) => {
  const user = await createUser("adam", "heslo")
  t.deepEqual(await getUserByToken(user.token), user)
  t.is(await getUserByToken("nesmysl"), null)
})

test.serial("register new user", async (t) => {
  const response = await supertest
    .agent(app)
    .post("/register")
    .type("form")
    .send({
      name: "Adam",
      password: "heslo",
    })
    .redirects(1)

  t.assert(response.text.includes("Adam"))
})
