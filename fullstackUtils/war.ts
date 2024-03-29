import { CurrentUser, PlayerName, Room } from "./internal"

export type WarGameStatus = "ready" | "in progress" | "wait" | "finished"

type CardValue = string

// https://stackoverflow.com/a/12646864/13584670
function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

const cardRanks = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]
const cardSuits = ["C", "H", "S", "D"]

export class WarRoom extends Room {
  status: "lobby" | "game" = "game"
  gameStatus: WarGameStatus
  private board: {
    winner: string | null
    playerCards: Record<PlayerName, { hand: CardValue[]; played: CardValue[] }>
  }

  constructor(code: string, players: CurrentUser[]) {
    super(code, "War", players)
    this.resetBoard()
  }

  static generateDeck() {
    let deck = cardSuits.flatMap((suit) => cardRanks.map((rank) => rank + suit))
    shuffle(deck)
    return deck
  }

  getClassifiedData(_: string) {
    const { board, ...everythingElse } = this
    const { playerCards, winner } = board
    const classifiedPlayerCards = Object.fromEntries(
      Object.entries(playerCards).map(([name, { hand, played }]) => {
        return [name, { played, hand: Array(hand.length) }]
      })
    )
    return { board: { playerCards: classifiedPlayerCards, winner }, ...everythingElse }
  }

  resetBoard() {
    const deck = WarRoom.generateDeck()
    this.board = {
      winner: null,
      playerCards: Object.fromEntries(
        this.players.map((player, i) => [
          player.name,
          { hand: deck.slice(i * 26, i * 26 + 26), played: [] },
        ])
      ),
    }
    this.gameStatus = "ready"
  }

  flip(playerName: PlayerName) {
    const playerNames = Object.keys(this.board.playerCards)
    const otherPlayerName = playerNames.find((n) => n !== playerName)!
    if (
      this.board.playerCards[playerName]!.played.length >
        this.board.playerCards[otherPlayerName]!.played.length ||
      this.gameStatus === "wait" ||
      this.gameStatus === "finished"
    )
      return

    let playedCardsAmts = Object.values(this.board.playerCards).map(
      (playerCard) => playerCard.played.length
    )
    const amount = playedCardsAmts.some((amt) => amt === 0) ? 1 : 2
    for (let i = 0; i < amount; i++) {
      if (this.board.playerCards[playerName]?.hand.length === 0) {
        this.gameStatus = "finished"
        this.board.winner = otherPlayerName
        return
      }
      this.board.playerCards[playerName]!.played.push(
        this.board.playerCards[playerName]!.hand.pop()!
      )
    }
    playedCardsAmts = Object.values(this.board.playerCards).map(
      (playerCard) => playerCard.played.length
    )
    if (playedCardsAmts[0] === playedCardsAmts[1]) {
      this.gameStatus = "wait"
    } else {
      this.gameStatus = "in progress"
    }
  }

  claimSpoils() {
    const playerNames = Object.keys(this.board.playerCards)

    const strengthToPlayer = Object.fromEntries(
      playerNames.map((name) => {
        const cardValue =
          this.board.playerCards[name]?.played[this.board.playerCards[name]!.played.length - 1]
        if (!cardValue) return [-1, name]

        const rank = cardValue[0]
        const strength = cardRanks.indexOf(rank!)

        return [strength, name]
      })
    )
    const strengths = Object.keys(strengthToPlayer).map((strength) => parseInt(strength))

    // if they're the same, then they merge into one strength
    if (strengths.length > 1) {
      let allPlayed: (string | string[])[] = playerNames.map((name) => {
        const copy = this.board.playerCards[name]!.played.slice(0)
        this.board.playerCards[name]!.played = []
        return copy
      })
      if (Math.floor(Math.random() * 2) === 1) {
        const temp = allPlayed[0]!
        allPlayed[0] = allPlayed[1]!
        allPlayed[1] = temp
      }
      allPlayed = allPlayed.flat()

      const claimer = strengthToPlayer[Math.max(...strengths)]!
      this.board.playerCards[claimer]?.hand.unshift(...(allPlayed as string[]))
    }

    this.gameStatus = "in progress"
  }
}

export type WarRoomData = {
  gameStatus: WarGameStatus
  board: {
    winner: string | null
    playerCards: Record<PlayerName, { hand: CardValue[]; played: CardValue[] }>
  }
} & Room
