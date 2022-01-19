import { RPSRoom, TTTRoom } from "./internal"

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

export const gameTypes = ["Rock Paper Scissors", "Tic Tac Toe"] as const
export type GameType = typeof gameTypes[number]

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
    if (this.gameType === "Rock Paper Scissors") {
      return new RPSRoom(this.code, this.players)
    } else if (this.gameType === "Tic Tac Toe") {
      return new TTTRoom(this.code, this.players)
    }
    return this
  }

  getClassifiedData(playerName: string) {
    return { ...this }
  }
}
