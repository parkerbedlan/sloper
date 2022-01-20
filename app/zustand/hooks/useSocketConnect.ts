import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { SocketOrUndefined, useSocketStore } from "./useSocketStore"

export const useSocketConnect: (
  query?:
    | {
        [key: string]: any
      }
    | undefined,
  onHandlers?: { on: string; listener: (...args: any[]) => void }[],
  isReady?: boolean
) => SocketOrUndefined = (query, onHandlers, isReady = true) => {
  const socket = useSocketStore((state) => state.value)
  const setSocket = useSocketStore((state) => state.set)

  // const dependencies = query ? Object.values(query) : []
  useEffect(
    () => {
      if (!isReady) return
      if (query && Object.values(query).some((value) => !value)) return
      console.log("---------------creating websocket connection---------------")
      setSocket(() => {
        // it appears that we don't have access to process.env.APP_ORIGIN on the frontend, but this works for some reason
        const newSocket = io(process.env.APP_ORIGIN as string, {
          query,
        })

        onHandlers?.forEach((handler) => {
          newSocket.on(handler.on, handler.listener)
        })

        return newSocket
      })
      return () => {
        setSocket((sock) => {
          sock?.disconnect()
          return undefined
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isReady]
    // [query, onHandlers, setSocket, ...dependencies]
  )

  return socket
}
