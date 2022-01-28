import { Flex } from "@chakra-ui/react"
import Layout from "app/core/layouts/Layout"
import { Card } from "app/game/cards/components/Card"
import { CardPile } from "app/game/cards/components/CardPile"
import { Felt } from "app/game/cards/components/Felt"
import { OpponentHands } from "app/game/cards/components/OpponentHands"
import { PlayerHand } from "app/game/cards/components/PlayerHand"
import { BlitzPage } from "blitz"
import React from "react"
import Page404 from "./404"

const Test: BlitzPage = () => {
  if (process.env.NODE_ENV !== "development") return <Page404 />
  return (
    <>
      <OpponentHands hands={{ joe: 40 }} />
      <PlayerHand onClick={() => console.log("hii")} />
      <Felt>
        <Card cardValue={"AS"} onClick={() => console.log("hi")} />
        <CardPile onClick={() => console.log("hey")} />
      </Felt>
    </>
  )
}

Test.suppressFirstRenderFlicker = true
Test.getLayout = (page) => <Layout title="Test">{page}</Layout>

export default Test
