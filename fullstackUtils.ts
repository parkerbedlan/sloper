import { User } from "@prisma/client"

export type Message = { roomCode: string; text: string; authorName: string }

export type RoomState = {
  status: "lobby" | "game"
  players: User[]
  messages: Message[]
}

export const initialRoomState: RoomState = {
  status: "lobby",
  players: [],
  messages: [],
}

const initialize = (...args: any[]) => {
  return initialRoomState
}

const addPlayer = (oldRoomState: RoomState, newPlayer: User) => {
  let newRoomState = { ...oldRoomState }
  newRoomState.players.push(newPlayer)
  return newRoomState
}

const removePlayer = (oldRoomState: RoomState, userId: number) => {
  let newRoomState = { ...oldRoomState }
  newRoomState.players = newRoomState.players.filter((p) => p.id !== userId)
  return newRoomState
}

const addMessage = (oldRoomState: RoomState, newMessage: Message) => {
  let newRoomState = { ...oldRoomState }
  newRoomState.messages.push(newMessage)
  return newRoomState
}

const handlers = {
  initialize: initialize,
  "new-message": addMessage,
  "new-player": addPlayer,
  "kicked-player": removePlayer,
}

export const actionTypes = ["initialize", "new-message", "new-player", "kicked-player"] as const
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
