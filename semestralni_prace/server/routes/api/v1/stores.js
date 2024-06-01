import { Router } from "express"
import {
  fetchAvailableStores,
  fetchAvailableStoreWithTables,
} from "../../../controllers/v1/stores.js"

export const router = Router()

router.get("/stores", fetchAvailableStores)
router.get("/store/:storeId", fetchAvailableStoreWithTables)
