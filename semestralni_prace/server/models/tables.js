import mongoose from "mongoose"
import TableSchema from "./schemas/table.js"

const Tables = mongoose.model("tables", TableSchema)

export default Tables
