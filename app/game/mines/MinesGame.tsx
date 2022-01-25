import { Box, Button, Flex, Grid, GridItem, Text } from "@chakra-ui/react"
import { MineIcon } from "app/core/components/icons/MineIcon"
import { SocketOrUndefined } from "app/zustand/hooks/useSocketStore"
import { MinesRoomData, MinesSquareOption } from "fullstackUtils/internal"
import React from "react"
import { CloseIcon } from "@chakra-ui/icons"
import { Image } from "blitz"

type MinesGameProps = { room: MinesRoomData; socket: SocketOrUndefined }

export const MinesGame: React.FC<MinesGameProps> = ({ room, socket }) => {
  return (
    <>
      <Flex>
        <Grid
          templateColumns={`repeat(${room.settings.width},${Math.floor(
            100 / room.settings.height
          )}vh)`}
          templateRows={`repeat(${room.settings.height}, ${Math.floor(
            100 / room.settings.height
          )}vh)`}
        >
          {room.board.squares.map((value, squareNum) => {
            const handleClick = (e: any) => {
              e.preventDefault()
              if (e.type === "click") {
                // console.log("left click", squareNum)
                socket?.emit("mines-left-click", squareNum)
              } else if (e.type === "contextmenu") {
                // console.log("right click", squareNum)
                socket?.emit("mines-right-click", squareNum)
              }
            }

            return <Square key={squareNum} value={value} onClick={handleClick} />
          })}
        </Grid>{" "}
        <Button
          onClick={() => {
            socket?.emit("mines-reset-board")
          }}
        >
          Reset
        </Button>
      </Flex>
    </>
  )
}

const Square: React.FC<{ value: MinesSquareOption; onClick: (e: any) => void }> = ({
  value,
  onClick,
}) => {
  const valueToDisplay = {
    _: undefined,
    0: undefined,
    bomb: <MineIcon w={"100%"} h={"100%"} />,
    blownup: <MineIcon w={"100%"} h={"100%"} />,
    wrong: (
      <Flex position="relative" alignItems="center" justifyContent={"center"}>
        <CloseIcon w={"100%"} h={"100%"} color="red" position="absolute" top="0%" left="0%" />
        <MineIcon w={"100%"} h={"100%"} />
      </Flex>
    ),
    flag: (
      <Flex justifyContent="center" alignItems={"center"}>
        <Image src="/flag.png" width="30%" height="30%" alt="flag" />
      </Flex>
    ),
    "?": <Text fontSize="3xl">?</Text>,
  }

  const display =
    value in valueToDisplay ? valueToDisplay[value] : <Text fontSize="2xl">{value}</Text>

  return (
    <GridItem
      boxShadow={"md"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      onClick={onClick}
      onContextMenu={onClick}
      cursor="default"
      border="1px"
      // borderColor={"gray.400"}
      bgColor={typeof value === "number" ? "gray.400" : value === "blownup" ? "red" : "gray.200"}
    >
      {display}
    </GridItem>
  )
}
