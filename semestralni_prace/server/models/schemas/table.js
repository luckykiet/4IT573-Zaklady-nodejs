import mongoose from "mongoose"
const { Schema } = mongoose

const TableSchema = new Schema(
  {
    storeId: { type: Schema.ObjectId, required: true },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    person: { type: Number, min: 1, required: true },
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { strict: true }
)

export default TableSchema
