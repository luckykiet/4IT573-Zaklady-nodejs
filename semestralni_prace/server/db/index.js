import mongoose from "mongoose"
import { CONFIG } from "../config/config.js"

class Database {
  static _database

  constructor() {
    const dbUrl = CONFIG.MONGODB_URI
    if (dbUrl) {
      mongoose
        .connect(dbUrl)
        .then(() => console.log("Connected with database"))
        .catch((err) => {
          console.error(
            "Error connecting to database:",
            err
          )
        })
    } else {
      console.error("Database URL is not provided")
    }
  }

  static getInstance() {
    if (!this._database) {
      this._database = new Database()
    }
    return this._database
  }
}

export default Database
