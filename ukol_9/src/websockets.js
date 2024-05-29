import { WebSocketServer } from "ws"
import ejs from "ejs"
import { getAllTodos, getTodoById } from "./db.js"

const connections = new Set()

export const createWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server })

  wss.on("connection", (socket) => {
    connections.add(socket)

    console.log("New connection", connections.size)

    socket.on("close", () => {
      connections.delete(socket)

      console.log("Closed connection", connections.size)
    })
  })
}

export const sendTodoListToAllConnections = async () => {
  const todoList = await ejs.renderFile(
    "views/_todos.ejs",
    {
      todos: await getAllTodos(),
    }
  )

  for (const connection of connections) {
    connection.send(
      JSON.stringify({
        type: "todoList",
        html: todoList,
      })
    )
  }
}

export const sendTodoDetailToAllConnections = async (
  id
) => {
  const todo = await getTodoById(id)

  const todoDetail = await ejs.renderFile(
    "views/_todo.ejs",
    {
      todo,
    }
  )

  for (const connection of connections) {
    connection.send(
      JSON.stringify({
        type: "todoDetail",
        id: todo.id,
        html: todoDetail,
      })
    )
  }
}

export const sendTodoDeletedToAllConnections = async (
  id
) => {
  for (const connection of connections) {
    connection.send(
      JSON.stringify({
        type: "todoDeleted",
        id,
      })
    )
  }
}
