import { User } from "@prisma/client"

type CurrentUser = {
  role: string
  id: number
  name: string
  room: {
    id: number
    code: string
  }
}

type ClientOrServer = "client" | "server"

export type Message = { roomCode: string; text: string; authorName: string }

export type PlayerName = string

const gameTypes = ["Rock Paper Scissors", "Tic Tac Toe"] as const
type GameType = typeof gameTypes[number]

export const rpsChoices = ["rock", "paper", "scissors"] as const
export type RPSChoice = typeof rpsChoices[number]

const tttChoices = ["X", "O", undefined] as const
export type TTTChoice = typeof tttChoices[number]

export type RoomState = {
  code: string
  status: "lobby" | "game"
  players: User[]
  messages: Message[]
} & GameTypes

type GameTypes =
  | {
      gameType: "Rock Paper Scissors"
      board:
        | undefined
        | {
            choices: Record<PlayerName, RPSChoice | null | "private">
            score: Record<PlayerName, number>
          }
    }
  | {
      gameType: "Tic Tac Toe"
      board:
        | undefined
        | [
            [TTTChoice, TTTChoice, TTTChoice],
            [TTTChoice, TTTChoice, TTTChoice],
            [TTTChoice, TTTChoice, TTTChoice]
          ]
    }

export const initialRoomState: RoomState = {
  code: "",
  status: "lobby",
  players: [],
  messages: [],
  gameType: "Rock Paper Scissors",
  board: undefined,
}

type Handler = (
  oldRoomState: RoomState | undefined,
  data: any,
  clientOrServer?: ClientOrServer,
  currentUser?: CurrentUser
) => RoomState

const setRoomState: Handler = (_oldRoomState, newRoomState: RoomState) => {
  return newRoomState
}

const initialize: Handler = (_oldRoomState, data: { gameType: GameType; code: string }) => {
  return { ...initialRoomState, ...data } as RoomState
}

const addPlayer: Handler = (oldRoomState: RoomState, newPlayer: User) => {
  let newRoomState = { ...oldRoomState }
  newRoomState.players.push(newPlayer)
  return newRoomState
}

const removePlayer: Handler = (oldRoomState: RoomState, userId: number) => {
  let newRoomState = { ...oldRoomState }
  newRoomState.players = newRoomState.players.filter((p) => p.id !== userId)
  return newRoomState
}

const addMessage: Handler = (oldRoomState: RoomState, newMessage: Message) => {
  let newRoomState = { ...oldRoomState }
  newRoomState.messages.push(newMessage)
  return newRoomState
}

const startGame: Handler = (oldRoomState: RoomState, ...args: any) => {
  let newRoomState = { ...oldRoomState }
  newRoomState.status = "game"
  if (newRoomState.gameType === "Rock Paper Scissors") {
    newRoomState.board = {
      choices: Object.fromEntries(newRoomState.players.map((player) => [player.name, null])),
      score: Object.fromEntries(newRoomState.players.map((player) => [player.name, 0])),
    }
    console.log("choices", newRoomState.board!.choices)
  }
  return newRoomState
}

const lobbyHandlers = {
  connected: setRoomState,
  initialize: initialize,
  "new-message": addMessage,
  "new-player": addPlayer,
  "kicked-player": removePlayer,
  "start-game": startGame,
}

const choose: Handler = (
  oldRoomState: RoomState,
  { choice, playerName }: { choice: RPSChoice; playerName: PlayerName }
) => {
  let newRoomState = { ...oldRoomState }
  if (newRoomState.gameType !== "Rock Paper Scissors") throw Error("wrong game type")

  newRoomState.board!.choices[playerName] = choice

  // if they're the second person to pick
  if (Object.values(newRoomState.board?.choices!).every((choice) => choice !== null)) {
    const entries = Object.entries(newRoomState.board!.choices) as any
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
      newRoomState.board!.score[winner] += 1
      console.log(winner, "won")
    }
    // reset choices
    newRoomState.board!.choices = Object.fromEntries(
      newRoomState.players.map((player) => [player.name, null])
    )
  }

  return newRoomState
}

const rpsHandlers = {
  "rps-choose": choose,
}

const handlers = { ...lobbyHandlers, ...rpsHandlers }

export const actionTypes = [
  "connected",
  "initialize",
  "new-message",
  "new-player",
  "kicked-player",
  "start-game",
  "rps-choose",
] as const
export type ActionType = typeof actionTypes[number]

export const roomReducer = (
  oldRoomState: RoomState | undefined,
  actionType: ActionType,
  actionPayload: any,
  ClientOrServer: ClientOrServer,
  currentUser?: CurrentUser
): RoomState => {
  // console.log("before", oldRoomState)
  const output = handlers[actionType](oldRoomState, actionPayload, "server", currentUser)
  // console.log("after", output)
  return output as RoomState
}

export const privacyFilter = (oldRoomState: RoomState): RoomState => {
  let newRoomState = { ...oldRoomState }
  if (newRoomState.gameType === "Rock Paper Scissors" && newRoomState.board) {
    newRoomState.board!.choices = Object.fromEntries(
      Object.entries(newRoomState.board!.choices).map(([playerName, choice]) => {
        return [playerName, choice ? "private" : null]
      })
    )
  }
  return newRoomState
}
