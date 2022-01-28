import { Box, Flex, Text } from "@chakra-ui/react"

export const Card: React.FC<
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
