import { User, Room as PrismaRoom } from "@prisma/client"

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

const reducers = {
  initialize: initialize,
  "new-message": addMessage,
  "new-player": addPlayer,
  "kicked-player": removePlayer,
}

export const roomReducer = (
  oldRoomState: RoomState | undefined,
  actionType: keyof typeof reducers,
  actionPayload: any
): RoomState => {
  console.log("before", oldRoomState)
  const output = reducers[actionType](oldRoomState, actionPayload)
  console.log("after", output)
  return output
}
