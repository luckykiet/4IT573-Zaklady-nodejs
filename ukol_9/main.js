import { app } from "./src/app.js"
import { createWebSocketServer } from "./src/websockets.js"

const server = app.listen(3000, () => {
  console.log("Server listening on http://localhost:3000")
})

createWebSocketServer(server)
