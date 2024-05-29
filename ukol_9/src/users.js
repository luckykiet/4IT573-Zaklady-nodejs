import crypto from "crypto"
import { db } from "./db.js"

export const createUser = async (name, password) => {
  const salt = crypto.randomBytes(32).toString("hex")
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex")
  const token = crypto.randomBytes(32).toString("hex")

  const [user] = await db("users")
    .insert({ name, salt, hash, token })
    .returning("*")

  return user
}

export const getUser = async (name, password) => {
  const user = await db("users").where({ name }).first()
  if (!user) return null
  const hash = crypto
    .pbkdf2Sync(password, user.salt, 1000, 64, "sha512")
    .toString("hex")
  if (user.hash !== hash) return null
  return user
}

export const getUserByToken = async (token) => {
  const user = await db("users").where({ token }).first()
  if (!user) return null
  return user
}
