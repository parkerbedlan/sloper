import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Text,
} from "@chakra-ui/react"
import { MineIcon } from "app/core/components/icons/MineIcon"
import { SocketOrUndefined } from "app/zustand/hooks/useSocketStore"
import {
  MinesPreset,
  minesPresets,
  MinesRoomData,
  MinesSquareOption,
} from "fullstackUtils/internal"
import React, { useEffect, useState } from "react"
import { CloseIcon } from "@chakra-ui/icons"
import { Image } from "blitz"

type MinesGameProps = { room: MinesRoomData; socket: SocketOrUndefined }

export const MinesGame: React.FC<MinesGameProps> = ({ room, socket }) => {
  const [selectedPreset, setSelectedPreset] = useState<MinesPreset | undefined>(undefined)

  useEffect(() => {
    setSelectedPreset(room.settings.preset)
  }, [room.settings.preset])

  useEffect(() => {
    if (selectedPreset) socket?.emit("mines-change-settings", { preset: selectedPreset })
  }, [selectedPreset, socket])

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
                socket?.emit("mines-left-click", squareNum)
              } else if (e.type === "contextmenu") {
                socket?.emit("mines-right-click", squareNum)
              }
            }

            return <Square key={squareNum} value={value} onClick={handleClick} />
          })}
        </Grid>{" "}
        <Flex direction="column">
          <Button
            onClick={() => {
              socket?.emit("mines-reset-board")
            }}
          >
            Reset
          </Button>
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                Settings
                <AccordionIcon />
              </AccordionButton>
              {/* TODO: put in radio comparable to rps radio */}
              <AccordionPanel>
                <MyRadioGroup
                  selectedValue={selectedPreset}
                  setSelectedValue={setSelectedPreset}
                  lockedIn={false}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
          <Text>Bombs left: {room.board.bombCounter}</Text>
          <Text>Time passed: {room.timer}</Text>
        </Flex>
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
      userSelect={"none"}
    >
      {display}
    </GridItem>
  )
}

const MyRadioGroup = ({ selectedValue, setSelectedValue, lockedIn }) => {
  return (
    <>
      <Flex justifyContent={"space-around"} direction="column">
        {minesPresets.map((value) => {
          return (
            <MyRadio
              key={value}
              {...{ value, selectedValue, setSelectedValue, disabled: lockedIn }}
            />
          )
        })}
      </Flex>
    </>
  )
}

const MyRadio = ({ value, selectedValue, setSelectedValue, disabled }) => {
  const checked = value === selectedValue
  return (
    <Flex
      onClick={() => {
        if (!disabled) setSelectedValue(value)
      }}
      aria-disabled={disabled}
      aria-checked={checked}
      cursor={disabled ? "not-allowed" : "pointer"}
      borderWidth="1px"
      borderRadius="md"
      boxShadow="md"
      _disabled={{ opacity: 0.5 }}
      _checked={{
        bg: "blue.500",
        color: "white",
        borderColor: "blue.500",
      }}
      _focus={{
        boxShadow: "outline",
      }}
      alignItems="center"
      justifyContent={"center"}
      p={2}
      // w={"30%"}
      // h={"7em"}
    >
      {value}
    </Flex>
  )
}
