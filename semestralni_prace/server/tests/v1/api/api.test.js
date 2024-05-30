import supertest from "supertest"
import app from "../../../app.js"
import mongoose from "mongoose"
const apiVersion = "v1"

let request = null
let server = null

beforeAll((done) => {
  server = app.listen(done)
  request = supertest.agent(server)
})

afterAll((done) => {
  server.close()
  mongoose.connection.close()
  done()
})

test("test random API access", async () => {
  const response = await request.get("/random")
  expect(response.status).not.toBe(200)
  expect(response.status).toBe(404)
})

test("test random API access", async () => {
  const response = await request.get(`/api/${apiVersion}`)
  expect(response.status).not.toBe(200)
  expect(response.status).toBe(404)
})

test("test ping", async () => {
  const response = await request.get(
    `/api/${apiVersion}/ping`
  )
  expect(response.status).toBe(200)
})

test("test echo", async () => {
  const response = await request.get(
    `/api/${apiVersion}/echo`
  )
  expect(response.status).toBe(200)
})
