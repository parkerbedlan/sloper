// server.ts
import blitz from "blitz/custom-server"
import { BlitzApiHandler } from "blitz"
import * as http from "http"
import * as socketio from "socket.io"
import express, { Express, Request, Response } from "express"
import { parse } from "url"
import { log } from "next/dist/server/lib/logging"
import { Message, Room } from "fullstackUtils"
import { User } from "@prisma/client"

const { PORT = "3000" } = process.env
const dev = process.env.NODE_ENV !== "production"
const blitzApp = blitz({ dev })
const blitzHandler: BlitzApiHandler = blitzApp.getRequestHandler()

blitzApp.prepare().then(async () => {
  const app: Express = express()
  const server: http.Server = http.createServer(app)
  const io: socketio.Server = new socketio.Server()
  io.attach(server)

  app.get("/hello", async (_: Request, res: Response) => {
    res.send("Hello World")
  })
  app.set("proxy", 1)

  const sockets: socketio.Socket[] = []
  const rooms: Record<string, Room> = {}

  io.on("connection", (socket: socketio.Socket) => {
    console.log("connection", socket.handshake.query)
    sockets.push(socket)

    const currentUser = JSON.parse(socket.handshake.query.currentUser as string) as User
    const roomCode = socket.handshake.query.roomCode as string
    if (roomCode) socket.join(roomCode)
    if (!(roomCode in rooms)) {
      rooms[roomCode] = new Room()
    }
    const room = rooms[roomCode]
    console.log("room", room)

    if (!room?.players.some((p) => p.id === currentUser.id)) {
      io.to(roomCode).emit("new-player-remote", currentUser)
      room?.addPlayer(currentUser)
    } else {
      io.to(roomCode).emit("player-online-remote", currentUser)
    }

    socket.emit("status", "Hello from Socket.io")

    // TODO: generalize: for each room handler, socket.on that handler
    socket.on("new-message", (newMessage: Message) => {
      console.log("new-message", newMessage)

      room?.addMessage(newMessage)
      // room?.handlers["new-message"](newMessage)
      io.to(roomCode).emit("new-message-remote", newMessage)
    })

    socket.on("disconnect", () => {
      console.log("client disconnected")
      io.to(roomCode).emit("player-offline-remote", currentUser)
      socket.disconnect()
    })
  })

  app.all("*", (req: any, res: any) => blitzHandler(req, res))

  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`)
  })
})