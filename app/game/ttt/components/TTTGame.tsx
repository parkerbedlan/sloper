import React from "react"
import { Box, Flex, Grid, GridItem, Text } from "@chakra-ui/react"
import { TTTOption, TTTRoomData } from "fullstackUtils/internal"
import { SocketOrUndefined } from "app/zustand/hooks/useSocketStore"
import { JsonDump } from "app/core/components/JsonDump"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"

type TTTGameProps = { room: TTTRoomData; socket: SocketOrUndefined }

export const TTTGame: React.FC<TTTGameProps> = ({ room, socket }) => {
  const currentUser = useCurrentUser()!
  return (
    <>
      <Flex justifyContent={"center"} alignItems="center" direction={"column"}>
        <Text fontSize={"2xl"}>You are: {room.board.assignments[currentUser.name]}</Text>
        <Text fontSize={"4xl"} m={4}>
          It&apos;s {room.board.currentTurn === currentUser.name ? "your" : "their"} turn.
        </Text>
        <Grid templateColumns={"8em 8em 8em"} templateRows={"8em 8em 8em"}>
          {[...Array(9)].map((_, i) => {
            const r = Math.floor(i / 3)
            const c = i % 3
            return (
              <Square
                key={i}
                value={room.board.squares[r]![c]}
                yourTurn={room.board.currentTurn === currentUser.name}
                onClick={() => {
                  console.log("clicked", r, c)
                  socket?.emit("ttt-choose", { playerName: currentUser.name, row: r, col: c })
                }}
              />
            )
          })}
        </Grid>
      </Flex>
      <Box>
        <Text fontWeight={"bold"}>Scores</Text>
        {room.players.map((player) => (
          <Flex key={player.name} alignItems="center">
            <Box minW={"20"}>
              <Text>{player.name === currentUser.name ? "You" : "Them"}: </Text>
            </Box>
            <Box>{room.board.score[player.name]}</Box>
          </Flex>
        ))}
      </Box>
      {/* <JsonDump>{room.board}</JsonDump> */}
    </>
  )
}

const Square: React.FC<{ value: TTTOption; yourTurn: boolean; onClick: () => void }> = ({
  value,
  yourTurn,
  onClick,
}) => {
  const clickable = value == null && yourTurn

  return (
    <GridItem
      w="100%"
      h="100%"
      boxShadow={"md"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      cursor={clickable ? "pointer" : "default"}
      _hover={clickable ? { bgColor: "gray.300" } : undefined}
      onClick={clickable ? onClick : () => console.log(value)}
    >
      <Text fontSize={"6xl"}>{value}</Text>
    </GridItem>
  )
}
