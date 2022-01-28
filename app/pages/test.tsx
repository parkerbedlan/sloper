import { Box, Flex, Text } from "@chakra-ui/react"
import Layout from "app/core/layouts/Layout"
import { BlitzPage } from "blitz"
import React from "react"
import Page404 from "./404"

const Test: BlitzPage = () => {
  if (process.env.NODE_ENV !== "development") return <Page404 />
  return (
    <>
      <OpponentHands numberOfPlayers={2} />
      <PlayerHand />
      <Flex
        justifyContent="center"
        alignItems={"center"}
        direction="column"
        py={"8rem"}
        bgColor="green.600"
        h="100vh"
      >
        <Card cardValue={"AS"} />
      </Flex>
    </>
  )
}

const OpponentHands: React.FC<{ numberOfPlayers: number }> = ({ numberOfPlayers }) => {
  return (
    <Box position="fixed" top="-10rem" left="50%" transform="translate(-50%, 0)">
      <CardPile amount={52} cardWidth={10} />
    </Box>
  )
}

const PlayerHand = () => {
  return (
    <Box position="fixed" bottom="-10rem" left="50%" transform="translate(-50%, 0)">
      <CardPile amount={52} cardWidth={10} />
    </Box>
  )
}

const CardPile: React.FC<{
  amount?: number
  topCardValue?: string
  cardWidth?: number
  onClick?: () => void
  cardValues?: string[]
  spaced?: boolean
}> = ({ amount, onClick, cardWidth, topCardValue, cardValues, spaced }) => {
  const realCardWidth = cardWidth || 8
  const width = `${realCardWidth}rem`
  const height = `${realCardWidth * 1.5}rem`

  const realAmount = amount || cardValues?.length || 5
  const realCardValues = cardValues || [...Array(realAmount)]

  return (
    <Box
      position={"relative"}
      cursor={onClick ? "pointer" : "default"}
      paddingRight={width}
      paddingBottom={height}
      onClick={onClick}
    >
      {realCardValues.map((cardValue, i) => (
        <Card
          key={i}
          position="absolute"
          left={spaced ? `${i * 1.75}rem` : `${i}px`}
          width={width}
          height={height}
          cardValue={cardValue ? cardValue : i === realAmount - 1 ? topCardValue : undefined}
        />
      ))}
    </Box>
  )
}

const Card: React.FC<
  React.ComponentProps<typeof Box> & { cardValue?: string; cardWidth?: number }
> = ({ cardValue, cardWidth, ...props }) => {
  const realCardWidth = cardWidth || 8
  const width = `${realCardWidth}rem`
  const height = `${realCardWidth * 1.5}rem`

  const suits = { C: "♣", H: "♥", S: "♠", D: "♦" }

  const cardDisplayTextProps = !cardValue
    ? undefined
    : { fontSize: "2xl", textColor: "HD".includes(cardValue[1]!) ? "red" : "black", lineHeight: 1 }
  const cardDisplay = !cardValue ? undefined : (
    <Box>
      <Flex direction="column" alignItems="center" justifyContent={"center"} w="1.5rem">
        <Text {...cardDisplayTextProps}>{cardValue[0] === "T" ? "10" : cardValue[0]}</Text>
        <Text {...cardDisplayTextProps}>{suits[cardValue[1]!]}</Text>
      </Flex>
    </Box>
  )

  return (
    <Box
      bgColor={"white"}
      border="1px"
      boxShadow={"sm"}
      borderRadius={"lg"}
      width={width}
      height={height}
      padding={"1"}
      cursor={props.onClick ? "pointer" : "default"}
      userSelect={"none"}
      onContextMenu={(e) => e.preventDefault()}
      {...props}
    >
      {!cardValue ? (
        <Box bgColor={"red.500"} w="100%" h="100%" borderRadius={"lg"} />
      ) : (
        <Flex direction="column" justifyContent={"space-between"} h="100%">
          <Box>{cardDisplay}</Box>
          <Box transform={"rotate(180deg)"}>{cardDisplay}</Box>
        </Flex>
      )}
    </Box>
  )
}

Test.suppressFirstRenderFlicker = true
Test.getLayout = (page) => <Layout title="Test">{page}</Layout>

export default Test
