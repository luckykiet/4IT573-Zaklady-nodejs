import mongoose from "mongoose"
import StoreSchema from "./schemas/store.js"

const Stores = mongoose.model("stores", StoreSchema)

export default Stores
