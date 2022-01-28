import { MinesRoom, RPSRoom, TTTRoom } from "./internal"

export type CurrentUser = {
  role: string
  id: number
  name: string
  room: {
    id: number
    code: string
  }
}

// TODO: take roomCode out of Message
export type Message = { roomCode: string; text: string; authorName: string }

export type PlayerName = string

export const gameTypes = ["Rock Paper Scissors", "Tic Tac Toe", "Minesweeper", "War"] as const
export type GameType = typeof gameTypes[number]

export const playerMins = {
  "Rock Paper Scissors": 2,
  "Tic Tac Toe": 2,
  Minesweeper: 1,
  War: 2,
}

export const playerCaps = {
  "Rock Paper Scissors": 2,
  "Tic Tac Toe": 2,
  Minesweeper: 10,
  War: 2,
  // "Prisoner's Dilemma": 10,
  // Chess: 2,
}

export class Room {
  code: string = ""
  status: "lobby" | "game" = "lobby"
  players: CurrentUser[] = []
  messages: Message[] = []
  gameType?: GameType = "Rock Paper Scissors"

  constructor(code: string, gameType?: GameType, players?: CurrentUser[]) {
    this.code = code
    if (gameType) this.gameType = gameType
    if (players) this.players = players
  }

  public addPlayer(newPlayer: CurrentUser) {
    this.players.push(newPlayer)
  }

  removePlayer(userId: number) {
    this.players = this.players.filter((p) => p.id !== userId)
  }

  addMessage(newMessage: Message) {
    this.messages.push(newMessage)
  }

  startGame(): Room {
    if (this.players.length < playerMins[this.gameType!]) throw Error("not enough players to start")
    if (this.gameType === "Rock Paper Scissors") {
      return new RPSRoom(this.code, this.players)
    } else if (this.gameType === "Tic Tac Toe") {
      return new TTTRoom(this.code, this.players)
    } else if (this.gameType === "Minesweeper") {
      return new MinesRoom(this.code, this.players) // TODO: change this to MinesRoom
    }
    return this
  }

  getClassifiedData(playerName: string): any {
    return { ...this }
  }
}
