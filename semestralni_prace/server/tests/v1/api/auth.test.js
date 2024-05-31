import supertest from "supertest"
import app from "../../../app.js"
import Users from "../../../models/users.js"
import bcrypt from "bcryptjs"
import * as db from "../../db.js"

const apiVersion = "v1"
const request = supertest(app)

beforeAll(async () => {
  await db.connect()
})

afterEach(async () => {
  await db.clearDatabase()
})

afterAll(async () => {
  await db.closeDatabase()
})

describe(`POST /api/${apiVersion}/register`, () => {
  test("should return 200 and register user successfully", async () => {
    const response = await request
      .post(`/api/${apiVersion}/register`)
      .send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        role: "guest",
      })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.msg.isAuthenticated).toBe(true)
    expect(response.body.msg.email).toBe("test@example.com")
    expect(response.body.msg.name).toBe("Test User")
    expect(response.body.msg.role).toBe("guest")
  })

  test("should return 200 and register user successfully", async () => {
    const response = await request
      .post(`/api/${apiVersion}/register`)
      .send({
        email: "test2@example.com",
        password: "password123",
        name: "Test User2",
        role: "merchant",
      })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.msg.isAuthenticated).toBe(true)
    expect(response.body.msg.email).toBe(
      "test2@example.com"
    )
    expect(response.body.msg.name).toBe("Test User2")
    expect(response.body.msg.role).toBe("merchant")
  })

  test("should return 400 for invalid request body", async () => {
    const response = await request
      .post(`/api/${apiVersion}/register`)
      .send({
        email: "invalid-email",
        password: "123",
        name: "T",
        role: "invalid-role",
      })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.msg).toBe("srv_invalid_request")
  })

  test("should return 409 for duplicate user", async () => {
    const existingUser = new Users({
      email: "duplicate@example.com",
      name: "Duplicate User",
      password: await bcrypt.hash("password123", 10),
      role: "guest",
    })
    await existingUser.save()

    const response = await request
      .post(`/api/${apiVersion}/register`)
      .send({
        email: "duplicate@example.com",
        password: "password123",
        name: "New User",
        role: "guest",
      })

    expect(response.status).toBe(409)
    expect(response.body.msg).toBe("srv_duplicate")
  })

  test("should return 403 for non-admin trying to register admin", async () => {
    const user = new Users({
      email: "admin@example.com",
      name: "Admin User",
      password: await bcrypt.hash("password123", 10),
      role: "guest",
    })
    await user.save()
    const loginResponse = await request
      .post(`/api/${apiVersion}/auth`)
      .send({
        email: "admin@example.com",
        password: "password123",
      })

    const response = await request
      .post(`/api/${apiVersion}/register`)
      .set("Cookie", loginResponse.headers["Set-Cookie"])
      .send({
        email: "newadmin@example.com",
        password: "password123",
        name: "New Admin",
        role: "admin",
      })

    expect(response.status).toBe(403)
    expect(response.body.msg).toBe("srv_no_privilleges")
  })
})
