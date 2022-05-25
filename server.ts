import { BlitzApiHandler } from "blitz"
import blitz from "blitz/custom-server"
import express, { Express, Request, Response } from "express"
import {
  CurrentUser,
  GameType,
  Message,
  Room,
  RPSOption,
  RPSRoom,
  TTTRoom,
  MinesPreset,
  MinesRoom,
  MinesChangeSettingsParameters,
} from "fullstackUtils/internal"
import { WarRoom } from "fullstackUtils/war"
import * as http from "http"
import * as socketio from "socket.io"
import os from "os"
export const getLANipAddress = () => {
  return os.networkInterfaces()["Wi-Fi"]?.find((ip) => ip.family === "IPv4")!.address
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

  type PlayerId = number
  const sockets: Record<PlayerId, socketio.Socket> = {}
  const rooms: Record<string, Room> = {}
  const timers: Record<string, NodeJS.Timer> = {}

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

    socket.emit("update", rooms[roomCode]?.getClassifiedData(currentUser.name))
    // console.log("update", rooms[roomCode]?.getClassifiedData(currentUser.name))

    const publicUpdate = (room: Room) => io.to(roomCode).emit("update", room)

    const privateUpdate = (room: Room) => {
      room.players.forEach((player) => {
        const playerSocket = sockets[player.id]
        playerSocket?.emit("update", room.getClassifiedData(player.name))
      })
    }

    const privateUpdateToAll = (room: Room) =>
      io.to(roomCode).emit("update", room.getClassifiedData(""))

    socket.on("new-player", (newPlayer: CurrentUser) => {
      rooms[roomCode]?.addPlayer(newPlayer)
      publicUpdate(rooms[roomCode]!)
    })

    socket.on("kicked-player", (userId: number) => {
      rooms[roomCode]?.removePlayer(userId)
      publicUpdate(rooms[roomCode]!)
    })

    socket.on("new-message", (newMessage: Message) => {
      rooms[roomCode]?.addMessage(newMessage)
      publicUpdate(rooms[roomCode]!)
    })

    socket.on("start-game", () => {
      rooms[roomCode] = rooms[roomCode]!.startGame()
      publicUpdate(rooms[roomCode]!)
    })

    socket.on("rps-choose", ({ playerName, choice }: { playerName: string; choice: RPSOption }) => {
      ;(rooms[roomCode] as RPSRoom).choose(playerName, choice)
      privateUpdate(rooms[roomCode]!)
    })

    // TODO: no need to get playerName passed as arg from client because we already know through currentUser.name
    socket.on(
      "ttt-choose",
      ({ playerName, row, col }: { playerName: string; row: number; col: number }) => {
        ;(rooms[roomCode] as TTTRoom).choose(playerName, row, col)
        publicUpdate(rooms[roomCode]!)
      }
    )

    socket.on(
      "mines-change-settings",
      ({ preset, height, width, numberOfBombs }: MinesChangeSettingsParameters) => {
        const room = rooms[roomCode] as MinesRoom
        if (timers[roomCode]) {
          clearInterval(timers[roomCode]!)
          delete timers[roomCode]
        }
        room.changeSettings({ preset, height, width, numberOfBombs })
        privateUpdateToAll(rooms[roomCode]!)
      }
    )

    socket.on("mines-reset-board", () => {
      const room = rooms[roomCode] as MinesRoom
      if (timers[roomCode]) {
        clearInterval(timers[roomCode]!)
        delete timers[roomCode]
      }
      room.resetBoard()
      privateUpdateToAll(rooms[roomCode]!)
    })

    socket.on("mines-left-click", (squareNum: number) => {
      const room = rooms[roomCode] as MinesRoom
      const gameStatusBefore = room.gameStatus

      room.leftClick(squareNum)
      privateUpdateToAll(rooms[roomCode]!)

      const gameStatusAfter = room.gameStatus

      if (gameStatusBefore === "ready" && gameStatusAfter === "in progress") {
        if (!timers[roomCode]) {
          timers[roomCode] = setInterval(() => {
            io.to(roomCode).emit("tick", room.tick())
          }, 1000)
        }
      } else if (
        gameStatusBefore === "in progress" &&
        (gameStatusAfter === "lost" || gameStatusAfter === "won")
      ) {
        if (timers[roomCode]) {
          clearInterval(timers[roomCode]!)
          delete timers[roomCode]
        }
      }
    })

    socket.on("mines-right-click", (squareNum: number) => {
      const room = rooms[roomCode] as MinesRoom
      room.rightClick(squareNum)
      privateUpdateToAll(room)
    })

    socket.on("war-reset", () => {
      const room = rooms[roomCode] as WarRoom
      room.resetBoard()
      privateUpdateToAll(room)
    })

    socket.on("war-flip", () => {
      const room = rooms[roomCode] as WarRoom
      if (room.gameStatus === "wait") return
      room.flip(currentUser.name)
      privateUpdateToAll(room)
      // @ts-ignore
      if (room.gameStatus === "wait") {
        setTimeout(() => {
          room.claimSpoils()
          privateUpdateToAll(room)
        }, 500)
      }
    })

    socket.on("disconnect", () => {
      console.log("client disconnected")
      io.to(roomCode).emit("player-offline", currentUser)

      rooms[roomCode]?.removePlayer(currentUser.id)
      delete sockets[currentUser.id]
      publicUpdate(rooms[roomCode]!)

      socket.disconnect()
    })
  })

  app.all("*", (req: any, res: any) => blitzHandler(req, res))

  // server.listen(PORT, getLANipAddress() as any, () => {
  //   console.log(`> Ready on http://${getLANipAddress()}:${PORT}`)
  // })
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`)
  })
})
