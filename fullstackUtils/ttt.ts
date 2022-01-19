import { Room, PlayerName, CurrentUser } from "./internal"

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value)
}

const tttOptions = ["X", "O", undefined] as const
export type TTTOption = typeof tttOptions[number]

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
