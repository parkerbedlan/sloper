import { Text } from "@chakra-ui/react"
import { SocketOrUndefined } from "app/zustand/hooks/useSocketStore"
import { MinesRoomData } from "fullstackUtils/internal"
import React from "react"

type MinesGameProps = { room: MinesRoomData; socket: SocketOrUndefined }

export const MinesGame: React.FC<MinesGameProps> = ({}) => {
  return (
    <>
      <Text fontSize="9xl">Welcome to Group Minesweeper</Text>
    </>
  )
}
