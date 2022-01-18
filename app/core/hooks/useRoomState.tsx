import { Text } from "@chakra-ui/react"
import Page404 from "app/pages/404"
import deleteUser from "app/rooms/mutations/deleteUser"
import checkRoomCode from "app/rooms/queries/checkRoomCode"
import getRoom from "app/rooms/queries/getRoom"
import { useSocketConnect } from "app/zustand/hooks/useSocketConnect"
import { SocketOrUndefined } from "app/zustand/hooks/useSocketStore"
import { useRouter, useParam, Routes, useMutation, useQuery } from "blitz"
import { RoomState, initialRoomState, actionTypes, roomReducer } from "fullstackUtils"
import { useEffect, useState } from "react"
import { useCurrentUser } from "./useCurrentUser"

type Status = "404" | "loading" | "success"

export const useRoomState: () => [RoomState, SocketOrUndefined, Status] = () => {
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

  const [roomState, setRoomState] = useState<RoomState>(initialRoomState)

  const socket = useSocketConnect(
    {
      roomCode: code,
      gameType: room ? room.gameType : false,
      currentUser: JSON.stringify(currentUser),
    },
    actionTypes.map((actionType) => ({
      on: actionType,
      listener: (data: any) => {
        console.log(actionType, data)
        setRoomState((roomState) =>
          roomReducer(roomState, actionType, data, "client", currentUser || undefined)
        )
      },
    })),
    !!room
  )

  // if (!roomState) return <Text>Connecting...</Text>

  let status: Status
  if (!roomExists) status = "404"
  else if (!room) status = "loading"
  else status = "success"

  return [roomState, socket, status]
}
