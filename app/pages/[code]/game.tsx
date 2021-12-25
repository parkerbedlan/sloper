import React from "react"
import { BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"
import { Wrapper } from "app/core/components/Wrapper"
import { Text } from "@chakra-ui/react"

const Game: BlitzPage = () => {
  return (
    <>
      <Wrapper>
        <Text>Game Page</Text>
      </Wrapper>
    </>
  )
}

Game.suppressFirstRenderFlicker = true
Game.getLayout = (page) => <Layout title="Game">{page}</Layout>

export default Game
