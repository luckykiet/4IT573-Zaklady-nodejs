import { getTodoById } from "../db.js"

export const checkThatTodoBelongsToCurentUser = async (
  req,
  res,
  next
) => {
  const todo = await getTodoById(req.params.id)
  if (todo.user_id === res.locals.user.id) return next()
  res.redirect("/")
}
