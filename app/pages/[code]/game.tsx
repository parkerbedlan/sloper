import React, { useEffect } from "react"
import { BlitzPage, Routes, useRouter } from "blitz"
import Layout from "app/core/layouts/Layout"
import { Wrapper } from "app/core/components/Wrapper"
import { Text } from "@chakra-ui/react"
import { useRoomState } from "../../core/hooks/useRoomState"
import Page404 from "../404"

const Game: BlitzPage = () => {
  const [roomState, socket, roomStatus] = useRoomState()

  const router = useRouter()
  useEffect(() => {
    if (roomState.status === "lobby" && roomState.code) {
      console.log("code", roomState.code)
      router.push(Routes.RoomPage({ code: roomState.code }))
    }
  }, [roomState.status, roomState.code, router])

  if (roomStatus === "404") return <Page404 />
  if (roomStatus === "loading") return <Text>Loading...</Text>

  return (
    <>
      <Wrapper>
        <Text>Game Page</Text>
        <pre>{JSON.stringify(roomState, null, 2)}</pre>
      </Wrapper>
    </>
  )
}

Game.suppressFirstRenderFlicker = true
Game.getLayout = (page) => <Layout title="Game">{page}</Layout>

export default Game
