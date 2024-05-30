import mongoose from "mongoose"
import UserSchema from "./schemas/user.js"

const Users = mongoose.model("users", UserSchema)

export default Users
