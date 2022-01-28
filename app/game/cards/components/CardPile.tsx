import { Box } from "@chakra-ui/react"
import { Card } from "./Card"

export const CardPile: React.FC<{
  amount?: number
  topCardValue?: string
  cardWidth?: number
  onClick?: (e: any) => void
  cardValues?: (string | undefined)[]
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
    >
      {realCardValues.map((cardValue, i) => (
        <Card
          key={i}
          position="absolute"
          left={spaced ? `${i * 1.75}rem` : `${i * 2}px`}
          width={width}
          height={height}
          cardValue={cardValue ? cardValue : i === realAmount - 1 ? topCardValue : undefined}
          onClick={i === realAmount - 1 ? onClick : undefined}
        />
      ))}
    </Box>
  )
}
