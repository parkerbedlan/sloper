// import create from "zustand"
import { Socket } from "socket.io-client"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import { createBasicStore } from "../zustandTools"

export type SocketOrUndefined = Socket<DefaultEventsMap, DefaultEventsMap> | undefined

export const useSocketStore = createBasicStore<SocketOrUndefined>(undefined)
