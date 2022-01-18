import checkRoomCode from "app/rooms/queries/checkRoomCode"
import getRoom from "app/rooms/queries/getRoom"
import { useSocketConnect } from "app/zustand/hooks/useSocketConnect"
import { SocketOrUndefined } from "app/zustand/hooks/useSocketStore"
import { Routes, useParam, useQuery, useRouter } from "blitz"
import { Room } from "fullstackUtils2"
import { useEffect, useState } from "react"
import { useCurrentUser } from "./useCurrentUser"

type Status = "404" | "loading" | "success"

export const useRoomState: () => [Room | undefined, SocketOrUndefined, Status] = () => {
  const router = useRouter()

  const code = useParam("code", "string")!
  if (code) {
    if (code.length !== 4) router.push(Routes.Home())
    const codeAllCaps = code.toUpperCase()
    if (code !== codeAllCaps) router.push(Routes.RoomPage({ code: codeAllCaps }))
  }

  const currentUser = useCurrentUser()

  const [room, { refetch: refetchRoom }] = useQuery(getRoom, { code }, { enabled: false })

  const [roomExists] = useQuery(checkRoomCode, { code })

  useEffect(() => {
    if (!currentUser || currentUser.room.code !== code) {
      router.push(Routes.Name({ code }))
      // return <Text>Redirecting...</Text>
    } else if (!room) {
      refetchRoom()
    }
  }, [roomExists, currentUser, room, code, router, refetchRoom])

  const [roomState, setRoomState] = useState<Room | undefined>(undefined)

  const socket = useSocketConnect(
    {
      roomCode: code,
      gameType: room ? room.gameType : false,
      currentUser: JSON.stringify(currentUser),
    },
    [
      {
        on: "update",
        listener: (data: any) => {
          setRoomState(data)
        },
      },
      {
        on: "sup",
        listener: (data: any) => {
          console.log("sup", data)
        },
      },
    ],
    !!room
  )

  // if (!roomState) return <Text>Connecting...</Text>

  let status: Status
  if (!roomExists) status = "404"
  else if (!room || !roomState) status = "loading"
  else status = "success"

  return [roomState, socket, status]
}
