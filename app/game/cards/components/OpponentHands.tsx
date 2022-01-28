import { Box } from "@chakra-ui/react"
import { CardPile } from "./CardPile"

type PlayerName = string
type numberOfCards = number
type Hands = Record<PlayerName, numberOfCards>

export const OpponentHands: React.FC<{ hands: Hands }> = ({ hands }) => {
  return (
    <Box position="fixed" top="-10rem" left="50%" transform="translate(-50%, 0)">
      <CardPile amount={Object.values(hands)[0]} cardWidth={10} />
    </Box>
  )
}
