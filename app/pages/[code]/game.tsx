import { Box, Text } from "@chakra-ui/react"
import { Wrapper } from "app/core/components/Wrapper"
import Layout from "app/core/layouts/Layout"
import { MinesGame } from "app/game/mines/MinesGame"
import { RPSGame } from "app/game/rps/components/RPSGame"
import { TTTGame } from "app/game/ttt/components/TTTGame"
import { BlitzPage, Routes, useRouter } from "blitz"
import { MinesRoomData, RPSRoomData, TTTRoomData } from "fullstackUtils/internal"
import React, { useEffect } from "react"
import { useRoomState } from "../../core/hooks/useRoomState"
import Page404 from "../404"

const Game: BlitzPage = () => {
  const [room, socket, roomStatus] = useRoomState()

  const router = useRouter()
  useEffect(() => {
    if (roomStatus === "success" && room!.status === "lobby" && room!.code) {
      router.push(Routes.RoomPage({ code: room!.code }))
    }
  }, [roomStatus, room, room?.status, room?.code, router])

  if (roomStatus === "404") return <Page404 />
  if (roomStatus === "loading" || !room) return <Text>Loading...</Text>

  if (room!.status === "lobby") return <Text>Redirecting...</Text>

  let gameNode: React.ReactNode = undefined
  if (room.gameType === "Rock Paper Scissors")
    gameNode = (
      <Wrapper>
        <RPSGame {...{ room: room as RPSRoomData, socket }} />
      </Wrapper>
    )
  else if (room.gameType === "Tic Tac Toe")
    gameNode = (
      <Wrapper>
        <TTTGame {...{ room: room as TTTRoomData, socket }} />
      </Wrapper>
    )
  else if (room.gameType === "Minesweeper")
    gameNode = (
      <Box m={2}>
        <MinesGame {...{ room: room as MinesRoomData, socket }} />
      </Box>
    )

  return <>{gameNode}</>
}

Game.suppressFirstRenderFlicker = true
Game.getLayout = (page) => <Layout title="Game">{page}</Layout>

export default Game
