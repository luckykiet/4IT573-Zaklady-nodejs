import { Router } from "express"

export const router = Router()

router.get(
  "/ping",
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  async (req, res) => {
    return res.sendStatus(200)
  }
)

router.get(
  "/echo",
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  async (req, res) => {
    return res.sendStatus(200)
  }
)
