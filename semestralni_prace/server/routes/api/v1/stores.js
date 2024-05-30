import { Router } from "express"
import { fetchAvailableStores } from "../../../controllers/v1/stores.js"

export const router = Router()

router.get("/stores", fetchAvailableStores)
