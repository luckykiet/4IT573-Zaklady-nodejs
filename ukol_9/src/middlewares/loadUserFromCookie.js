import { getUserByToken } from "../users.js"

export const loadUserFromCookie = async (
  req,
  res,
  next
) => {
  const token = req.cookies.token
  if (!token) return next()
  res.locals.user = await getUserByToken(token)
  next()
}
