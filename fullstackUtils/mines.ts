import { CurrentUser, Room } from "./internal"

export class MinesRoom extends Room {
  status: "lobby" | "game" = "game"
  timer: number
  private board: {
    squares: []
  }

  constructor(code: string, players: CurrentUser[]) {
    super(code, "Minesweeper", players)
    this.board = { squares: [] }
  }
}

export type MinesRoomData = {
  timer: number
  board: {
    squares: []
  }
} & Room
