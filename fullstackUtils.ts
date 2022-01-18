import { User } from "@prisma/client"

export type Message = { roomCode: string; text: string; authorName: string }

const gameTypes = ["Rock Paper Scissors", "Tic Tac Toe"] as const
type GameType = typeof gameTypes[number]

export type RoomState = {
  status: "lobby" | "game"
  players: User[]
  messages: Message[]
  gameType: GameType
}

export const initialRoomState: RoomState = {
  status: "lobby",
  players: [],
  messages: [],
  gameType: "Rock Paper Scissors",
}

type Handler = (oldRoomState: RoomState | undefined, data: any) => RoomState

const setRoomState: Handler = (_oldRoomState, newRoomState: RoomState) => {
  return newRoomState
}

const initialize: Handler = (_oldRoomState, gameType: GameType) => {
  return { ...initialRoomState, gameType }
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
  return newRoomState
}

const handlers = {
  connected: setRoomState,
  initialize: initialize,
  "new-message": addMessage,
  "new-player": addPlayer,
  "kicked-player": removePlayer,
  "start-game": startGame,
}

export const actionTypes = [
  "connected",
  "initialize",
  "new-message",
  "new-player",
  "kicked-player",
  "start-game",
] as const
export type ActionType = typeof actionTypes[number]

export const roomReducer = (
  oldRoomState: RoomState | undefined,
  actionType: ActionType,
  actionPayload: any
): RoomState => {
  // console.log("before", oldRoomState)
  const output = handlers[actionType](oldRoomState, actionPayload)
  // console.log("after", output)
  return output
}
