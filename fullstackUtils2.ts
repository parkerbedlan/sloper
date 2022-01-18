import { User } from "@prisma/client"

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

export const rpsOptions = ["rock", "paper", "scissors"] as const
export type RPSOption = typeof rpsOptions[number]

const tttOptions = ["X", "O", undefined] as const
export type TTTOption = typeof tttOptions[number]

// export type RoomState = {
//   code: string
//   status: "lobby" | "game"
//   players: User[]
//   messages: Message[]
// } & GameTypes

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
    }
    return this
  }
}

export class RPSRoom extends Room {
  status: "lobby" | "game" = "game"
  private board: {
    roundNumber: number
    choices: Record<PlayerName, RPSOption | null | "private">
    score: Record<PlayerName, number>
  }

  constructor(code: string, players: CurrentUser[]) {
    super(code, "Rock Paper Scissors", players)
    this.board = {
      roundNumber: 1,
      choices: Object.fromEntries(this.players.map((player) => [player.name, null])),
      score: Object.fromEntries(this.players.map((player) => [player.name, 0])),
    }
  }

  choose(playerName: string, choice: RPSOption) {
    this.board.choices[playerName] = choice

    // if they're the second person to pick
    if (Object.values(this.board.choices).every((choice) => choice !== null)) {
      const entries = Object.entries(this.board.choices) as any
      const choices = [entries[0][1], entries[1][1]]
      let winner: string | undefined
      if (choices.includes("rock")) {
        if (choices.includes("paper")) {
          winner = entries[choices.indexOf("paper")][0]
        } else if (choices.includes("scissors")) {
          winner = entries[choices.indexOf("rock")][0]
        }
      } else if (choices.includes("paper")) {
        if (choices.includes("scissors")) {
          winner = entries[choices.indexOf("scissors")][0]
        }
      }
      if (winner) {
        this.board.score[winner] += 1
        console.log(winner, "won")
      }
      // reset choices
      this.board.choices = Object.fromEntries(this.players.map((player) => [player.name, null]))
      this.board.roundNumber += 1
    }
  }

  getClassifiedData(playerName: string) {
    return { ...this }
  }

  // TODO: make data classified
  private getBoard(playerName: string) {
    return this.board
  }
}

export type RPSRoomData = {
  status: "lobby" | "game"
  board: {
    roundNumber: number
    choices: Record<PlayerName, RPSOption | null | "private">
    score: Record<PlayerName, number>
  }
} & Room
