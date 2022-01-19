import { User } from "@prisma/client"

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value)
}

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

  getClassifiedData(playerName: string) {
    return { ...this }
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
    let classifiedChoices = Object.fromEntries(
      Object.entries(this.board.choices).map(([name, choice]) =>
        name === playerName ? [name, choice] : choice === null ? [name, null] : [name, "private"]
      ) as any
    )
    return { ...this, board: { ...this.board, choices: classifiedChoices } }
  }
}

export type RPSRoomData = {
  board: {
    roundNumber: number
    choices: Record<PlayerName, RPSOption | null | "private">
    score: Record<PlayerName, number>
  }
} & Room

export class TTTRoom extends Room {
  status: "lobby" | "game" = "game"
  private board: {
    assignments: Record<PlayerName, TTTOption>
    currentTurn: PlayerName
    squares: [
      [TTTOption, TTTOption, TTTOption],
      [TTTOption, TTTOption, TTTOption],
      [TTTOption, TTTOption, TTTOption]
    ]
    score: Record<PlayerName, number>
  }

  constructor(code: string, players: CurrentUser[]) {
    super(code, "Tic Tac Toe", players)
    const firstPlayerName = this.players[Math.floor(Math.random() * 2)]!.name
    this.board = {
      assignments: Object.fromEntries(
        this.players.map((player) => [player.name, firstPlayerName === player.name ? "X" : "O"])
      ),
      currentTurn: firstPlayerName,
      squares: [
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
      ],
      score: Object.fromEntries(this.players.map((player) => [player.name, 0])),
    }
  }

  choose(playerName: PlayerName, row: number, col: number) {
    if (this.board.squares[row]![col] !== undefined) throw Error("that square is already taken")
    this.board.squares[row]![col] = this.board.assignments[playerName]
    const winner = this.winner()
    if (winner === "tie") {
      this.resetBoard()
    } else if (winner !== "incomplete") {
      this.board.score[winner] += 1
      this.resetBoard()
    }
  }

  private resetBoard(): void {
    this.board.squares = [
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
    ]
    this.board.assignments = Object.fromEntries(
      Object.entries(this.board.assignments).map(([playerName, option]) => [
        playerName,
        option === "X" ? "O" : "X",
      ])
    )
    this.board.currentTurn = getKeyByValue(this.board.assignments, "X") as string
  }

  private winner(): PlayerName | "tie" | "incomplete" {
    // check for winner
    // const winningCombos = [
    //   [[0,0], [0,1], [0,2]],
    //   [[1,0], [1,1], [1,2],],
    //   [[2,0], [2,1], [2,2]],
    //   [[0,0], [1,0], [2,0]],
    //   [[,], [,], [,]],
    //   [[,], [,], [,]],
    //   [[,], [,], [,]],
    //   [[,], [,], [,]],
    // ]

    // check columns
    for (let c = 0; c < 3; c++) {
      if (
        this.board.squares[0][c] !== undefined &&
        [...Array(3)]
          .map((_, r) => this.board.squares[r]![c])
          .every((square) => square === this.board.squares[0][c])
      ) {
        return getKeyByValue(this.board.assignments, this.board.squares[0][c]) as string
      }
    }

    // check rows
    for (let r = 0; r < 3; r++) {
      if (
        this.board.squares[r]![0] !== undefined &&
        [...Array(3)]
          .map((_, c) => this.board.squares[r]![c])
          .every((square) => square === this.board.squares[r]![0])
      ) {
        return getKeyByValue(this.board.assignments, this.board.squares[r]![0]) as string
      }
    }

    // check diagonals
    if (
      this.board.squares[0][0] !== undefined &&
      [...Array(3)]
        .map((_, i) => this.board.squares[i]![i])
        .every((square) => square === this.board.squares[0][0])
    ) {
      return getKeyByValue(this.board.assignments, this.board.squares[0][0]) as string
    }
    if (
      this.board.squares[0][2] !== undefined &&
      [...Array(3)]
        .map((_, i) => this.board.squares[i]![2 - i])
        .every((square) => square === this.board.squares[0][2])
    ) {
      return getKeyByValue(this.board.assignments, this.board.squares[0][2]) as string
    }

    // check if board is full
    let isFull = true
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (this.board.squares[r]![c] === undefined) {
          isFull = false
          break
        }
      }
      if (!isFull) break
    }
    if (isFull) return "tie"
    return "incomplete"
  }
}

export type TTTRoomData = {
  board: {
    assignments: Record<PlayerName, TTTOption>
    currentTurn: PlayerName
    squares: [
      [TTTOption, TTTOption, TTTOption],
      [TTTOption, TTTOption, TTTOption],
      [TTTOption, TTTOption, TTTOption]
    ]
    score: Record<PlayerName, number>
  }
} & Room
