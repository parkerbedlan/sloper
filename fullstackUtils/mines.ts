// base off of www.freeminesweeper.org

import { CurrentUser, Room } from "./internal"

export type MinesSquareOption = "_" | "?" | "flag" | number | "blownup" | "wrong" | "bomb"
export class MinesRoom extends Room {
  status: "lobby" | "game" = "game"
  settings: {
    preset: "beginner" | "intermediate" | "expert" | "custom"
    height: number
    width: number
    numberOfBombs: number
  }
  private board: {
    hasBomb: boolean[]
    bombCounter: number
    squares: MinesSquareOption[]
    numberOfClicks: number
  }
  timer: number

  static presets = {
    beginner: { height: 8, width: 8, numberOfBombs: 10 },
    intermediate: { height: 16, width: 16, numberOfBombs: 40 },
    expert: { height: 16, width: 31, numberOfBombs: 99 },
  }

  constructor(code: string, players: CurrentUser[]) {
    super(code, "Minesweeper", players)
    this.changeSettings("intermediate")
    this.resetBoard()
  }

  changeSettings(
    preset: typeof this.settings.preset,
    height?: number,
    width?: number,
    numberOfBombs?: number
  ) {
    if (preset !== "custom") {
      this.settings = { ...MinesRoom.presets[preset], preset }
    } else if (height && width && numberOfBombs) {
      this.settings = { preset, height, width, numberOfBombs }
    } else {
      throw Error("parameter error: custom preset must include height, width, and numberOfBombs")
    }
  }

  resetBoard() {
    const numberOfSquares = this.settings.height * this.settings.width
    this.board.bombCounter = this.settings.numberOfBombs
    this.board.squares = Array(numberOfSquares).fill("_")
    this.board.hasBomb = Array(numberOfSquares).fill(false)
    this.board.numberOfClicks = 0
    this.timer = 0
  }

  rightClick(squareNum: number) {
    const cycle = { _: "flag", flag: "?", "?": "_" }

    const currentVal = this.board.squares[squareNum]
    if (currentVal && currentVal in cycle) {
      this.board.squares[squareNum] = cycle[currentVal]
    }
  }

  leftClick(squareNum: number) {
    if (this.board.numberOfClicks === 0) {
      return this.firstClick(squareNum)
    }

    const currentVal = this.board.squares[squareNum]
    if (typeof currentVal === "number") {
      if (this.neighborFlags(squareNum) >= currentVal) {
        this.clearNeighbors(squareNum)
      }
    } else if (currentVal === "_" || currentVal === "?") {
      this.clear(squareNum)
    }
  }

  private neighborBombs(squareNum: number): number {
    const neighbors = this.neighbors(squareNum)
    const bombs = neighbors.filter((neighbor) => this.board.squares[neighbor] === "bomb").length
    return bombs
  }

  private neighborFlags(squareNum: number): number {
    const neighbors = this.neighbors(squareNum)
    const flags = neighbors.filter((neighbor) => this.board.squares[neighbor] === "flag").length
    return flags
  }

  private clearNeighbors(squareNum: number) {
    const neighbors = this.neighbors(squareNum)
    neighbors.forEach((neighbor) => this.clear(neighbor))
  }

  private neighbors(squareNum: number): number[] {
    const width = this.settings.width

    const r = Math.floor(squareNum / width)
    const c = squareNum % width

    let neighbors: number[] = []
    for (let ri = r - 1; ri <= r + 1; ri++) {
      for (let ci = c - 1; ci <= c + 1; ci++) {
        if (ri < 0 || ri >= width || ci < 0 || ci >= width || (ri === r && ci === c)) continue
        neighbors.push(this.rcToSquareNum(ri, ci))
      }
    }

    return neighbors
  }

  private rcToSquareNum(r: number, c: number) {
    return r * this.settings.width + c
  }

  private clear(squareNum: number) {
    if (this.board.hasBomb[squareNum]) {
      this.board.squares[squareNum] = "blownup"
      this.gameOver()
    } else {
      this.board.squares[squareNum] = this.neighborBombs(squareNum)
      if (this.board.squares[squareNum] === 0) {
        const neighbors = this.neighbors(squareNum)
        neighbors.forEach((neighbor) => this.clear(squareNum))
      }
    }
  }

  private firstClick(squareNum: number) {
    let immune = new Set([squareNum, ...this.neighbors(squareNum)])

    let eligible = Array.from(Array(this.board.hasBomb.length).keys()) // 0 to N
    eligible = eligible.filter((num) => immune.has(num))
    let bombCount = this.settings.numberOfBombs

    while (bombCount > 0) {
      const bombIndex = Math.floor(Math.random() * eligible.length)
      const bombNum = eligible[bombIndex] as number
      eligible.splice(bombIndex, 1)
      this.board.hasBomb[bombNum] = true
      bombCount--
    }

    this.leftClick(squareNum)
  }

  private gameOver() {
    Array.from(Array(this.board.squares.length).keys()).forEach((squareNum) => {
      const square = this.board.squares[squareNum]
      const hasBomb = this.board.hasBomb[squareNum]
      if (square === "flag" && hasBomb) {
        this.board.squares[squareNum] = "wrong"
      } else if ((square === "?" || square === "_") && hasBomb) {
        this.board.squares[squareNum] = "bomb"
      } else if (square === "?" || square === "_") {
        this.board.squares[squareNum] = this.neighborBombs(squareNum)
      }
    })
    throw Error("not yet implemented")
  }
}

export type MinesRoomData = {
  settings: {
    preset: "beginner" | "intermediate" | "expert" | "custom"
    height: number
    width: number
    numberOfBombs: number
  }
  board: {
    bombCounter: number
    squares: MinesSquareOption[]
    numberOfClicks: number
  }
  timer: number
} & Room
