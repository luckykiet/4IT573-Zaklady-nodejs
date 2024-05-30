import mongoose from "mongoose"
import utils from "../../utils.js"
const { Schema } = mongoose
import { ROLES } from "../../config/roles.js"

const UserSchema = new Schema(
  {
    email: {
      type: String,
      match: [utils.emailRegex, "srv_invalid_email"],
      required: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      default: "guest",
      enum: ROLES,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { strict: true, timestamps: true }
)

UserSchema.indexes({
  name: 1,
  role: 1,
})

export default UserSchema
