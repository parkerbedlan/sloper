// server.ts
import { BlitzApiHandler } from "blitz"
import blitz from "blitz/custom-server"
import express, { Express, Request, Response } from "express"
import { actionTypes, roomReducer, RoomState } from "fullstackUtils"
import * as http from "http"
import * as socketio from "socket.io"
// import { User } from "@prisma/client"

type CurrentUser = {
  role: string
  id: number
  name: string
  room: {
    id: number
    code: string
  }
}

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
  const roomStates: Record<string, RoomState> = {}

  io.on("connection", (socket: socketio.Socket) => {
    console.log("connection", socket.handshake.query)
    sockets.push(socket)

    const currentUser = JSON.parse(socket.handshake.query.currentUser as string) as CurrentUser
    const roomCode = socket.handshake.query.roomCode as string
    const gameType = socket.handshake.query.gameType as string
    if (roomCode) socket.join(roomCode)
    if (!(roomCode in roomStates)) {
      roomStates[roomCode] = roomReducer(undefined, "initialize", gameType)
    }
    // let roomState = roomStates[roomCode]
    // console.log("room", roomState)

    if (
      currentUser &&
      !roomStates[roomCode]?.players.some((p) => p.id === currentUser.id) &&
      currentUser.room.code === roomCode
    ) {
      io.to(roomCode).emit("new-player-remote", currentUser)
      roomStates[roomCode] = roomReducer(roomStates[roomCode], "new-player", currentUser)
    } else {
      io.to(roomCode).emit("player-online-remote", currentUser)
    }

    socket.emit("connected", roomStates[roomCode])

    actionTypes.forEach((actionType) => {
      socket.on(actionType, (data: any) => {
        console.log(actionType, data)
        console.log("before", roomStates[roomCode])
        roomStates[roomCode] = roomReducer(roomStates[roomCode], actionType, data)
        console.log("after", roomStates[roomCode])
        io.to(roomCode).emit(`${actionType}-remote`, data)
      })
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
