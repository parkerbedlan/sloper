import { Room, PlayerName, CurrentUser } from "./internal"

export const rpsOptions = ["rock", "paper", "scissors"] as const
export type RPSOption = typeof rpsOptions[number]

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
