import { set, connect } from "mongoose"
import { CONFIG } from "../config"

set("strictQuery", false)

const connectDB = async () => {
  const connection = await connect(CONFIG.MONGODB_URI)
  console.log("MongoDB connected!")
  return connection.connection.getClient()
}

export default connectDB
