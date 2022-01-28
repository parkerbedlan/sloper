import { Box } from "@chakra-ui/react"
import { CardPile } from "./CardPile"

export const PlayerHand: React.FC<{ amount?: number; onClick?: (e: any) => void }> = ({
  amount,
  onClick,
}) => {
  return (
    <Box position="fixed" bottom="-10rem" left="50%" transform="translate(-50%, 0)">
      <CardPile amount={amount} cardWidth={10} onClick={onClick} />
    </Box>
  )
}
