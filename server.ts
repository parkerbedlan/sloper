import { BlitzApiHandler } from "blitz"
import blitz from "blitz/custom-server"
import express, { Express, Request, Response } from "express"
import {
  CurrentUser,
  GameType,
  Message,
  PlayerName,
  Room,
  RPSOption,
  RPSRoom,
} from "fullstackUtils2"
import * as http from "http"
import * as socketio from "socket.io"

// testing
// const rooms: Record<string, Room> = {}
// const roomCode = "ASDF"
// rooms[roomCode] = new Room(roomCode, "Rock Paper Scissors")
// rooms[roomCode]?.addPlayer({
//   id: 69,
//   name: "PARKOUR",
//   role: "HOST",
//   room: { id: 666, code: "ASDF" },
// })
// rooms[roomCode]?.addPlayer({
//   id: 70,
//   name: "JIMMY",
//   role: "PLAYER",
//   room: { id: 666, code: "ASDF" },
// })
// console.log(rooms[roomCode])
// rooms[roomCode] = rooms[roomCode]!.startGame()
// console.log(rooms[roomCode])

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

  type PlayerId = number
  const sockets: Record<PlayerId, socketio.Socket> = {}
  const rooms: Record<string, Room> = {}

  io.on("connection", (socket: socketio.Socket) => {
    console.log("connection", socket.handshake.query)

    const currentUser = JSON.parse(socket.handshake.query.currentUser as string) as CurrentUser
    sockets[currentUser.id] = socket
    const roomCode = socket.handshake.query.roomCode as string
    const gameType = socket.handshake.query.gameType as GameType
    if (roomCode) socket.join(roomCode)
    if (!(roomCode in rooms)) {
      rooms[roomCode] = new Room(roomCode, gameType)
    }

    if (
      currentUser &&
      !rooms[roomCode]?.players.some((p) => p.id === currentUser.id) &&
      currentUser.room.code === roomCode
    ) {
      rooms[roomCode]?.addPlayer(currentUser)
      io.to(roomCode).emit("update", rooms[roomCode])
    } else {
      io.to(roomCode).emit("player-online", currentUser)
    }

    // TODO: privacy filter this
    socket.emit("update", rooms[roomCode]?.getClassifiedData(currentUser.name))
    console.log("update", rooms[roomCode]?.getClassifiedData(currentUser.name))

    const publicUpdate = (room: Room) => io.to(roomCode).emit("update", room)

    const privateUpdate = (room: Room) => {
      room.players.forEach((player) => {
        const playerSocket = sockets[player.id]
        playerSocket?.emit("update", room.getClassifiedData(player.name))
      })
    }

    socket.on("new-player", (newPlayer: CurrentUser) => {
      rooms[roomCode]?.addPlayer(newPlayer)
      // io.to(roomCode).emit("update", rooms[roomCode])
      publicUpdate(rooms[roomCode]!)
    })

    socket.on("kicked-player", (userId: number) => {
      rooms[roomCode]?.removePlayer(userId)
      // io.to(roomCode).emit("update", rooms[roomCode])
      publicUpdate(rooms[roomCode]!)
    })

    socket.on("new-message", (newMessage: Message) => {
      rooms[roomCode]?.addMessage(newMessage)
      // io.to(roomCode).emit("update", rooms[roomCode])
      publicUpdate(rooms[roomCode]!)
      // to test individual message sending
      rooms[roomCode]?.players.forEach((player) => {
        const playerSocket = sockets[player.id]
        playerSocket?.emit("sup", player.name)
      })
    })

    socket.on("start-game", () => {
      rooms[roomCode] = rooms[roomCode]!.startGame()
      // io.to(roomCode).emit("update", rooms[roomCode])
      publicUpdate(rooms[roomCode]!)
    })

    socket.on("rps-choose", ({ playerName, choice }: { playerName: string; choice: RPSOption }) => {
      ;(rooms[roomCode] as RPSRoom).choose(playerName, choice)
      // TODO emit private version to each player
      // io.to(roomCode).emit("update", rooms[roomCode])
      // publicUpdate(rooms[roomCode]!)
      privateUpdate(rooms[roomCode]!)
    })

    socket.on("disconnect", () => {
      console.log("client disconnected")
      io.to(roomCode).emit("player-offline", currentUser)
      socket.disconnect()
    })
  })

  app.all("*", (req: any, res: any) => blitzHandler(req, res))

  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`)
  })
})
