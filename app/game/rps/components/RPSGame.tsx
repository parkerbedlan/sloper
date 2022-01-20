import { Flex, Button, Box, Text } from "@chakra-ui/react"
import { PaperIcon } from "app/core/components/icons/PaperIcon"
import { RockIcon } from "app/core/components/icons/RockIcon"
import { ScissorsIcon } from "app/core/components/icons/ScissorsIcon"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { SocketOrUndefined } from "app/zustand/hooks/useSocketStore"
import { Image } from "blitz"
import { RPSRoomData, RPSOption, rpsOptions } from "fullstackUtils/internal"
import React, { useEffect, useState } from "react"

type RPSGameProps = { room: RPSRoomData; socket: SocketOrUndefined }

export const RPSGame: React.FC<RPSGameProps> = ({ room, socket }) => {
  if (room.gameType !== "Rock Paper Scissors") throw Error("wrong game type")

  const currentUser = useCurrentUser()!

  const board = room.board
  const choices = board.choices
  const score = board.score
  const roundNumber = board.roundNumber

  const [selectedValue, setSelectedValue] = useState<RPSOption | undefined>(
    (choices[currentUser.name] as RPSOption) || undefined
  )
  const [lockedIn, setLockedIn] = useState<boolean>(!!choices[currentUser.name])

  useEffect(() => {
    const myChoice = choices[currentUser.name]
    if (myChoice) {
      setSelectedValue(myChoice as RPSOption)
      setLockedIn(true)
    } else {
      setSelectedValue(undefined)
      setLockedIn(false)
    }
  }, [currentUser, choices])

  return (
    <>
      <Text m={4}>Round {roundNumber}</Text>
      <RPSRadioGroup {...{ selectedValue, setSelectedValue, lockedIn }} />
      <Flex justifyContent={"space-between"} alignItems={"center"} m={4}>
        <ChoiceIndicators choices={choices} score={score} />
        <Button
          colorScheme={"blue"}
          disabled={!selectedValue || lockedIn}
          onClick={() => {
            console.log("choosing", selectedValue)
            socket?.emit("rps-choose", { choice: selectedValue, playerName: currentUser.name })
            setLockedIn(true)
          }}
        >
          Choose
        </Button>
      </Flex>
    </>
  )
}

const ChoiceIndicators = ({ choices, score }) => {
  return (
    <Box>
      {Object.keys(choices).map((playerName) => (
        <Flex key={playerName} alignItems="center">
          <Box minW={"24"}>
            <Text>{playerName}: </Text>
          </Box>
          <Box>{score[playerName]}</Box>
          <Flex flexShrink="unset" justifyContent={"center"} w={10}>
            {choices[playerName] !== null ? (
              <Text>✔</Text>
            ) : (
              <Image src={"/typing.gif"} alt="typing" width={40} height={13} />
            )}
          </Flex>
        </Flex>
      ))}
    </Box>
  )
}

function RPSRadioGroup({ selectedValue, setSelectedValue, lockedIn }) {
  return (
    <>
      <Flex justifyContent={"space-around"}>
        {rpsOptions.map((value) => {
          return <RPSRadio key={value} {...{ value, selectedValue, setSelectedValue, lockedIn }} />
        })}
      </Flex>
    </>
  )
}

function RPSRadio({ value, selectedValue, setSelectedValue, lockedIn }) {
  const icons = {
    rock: <RockIcon boxSize={"44"} />,
    paper: <PaperIcon boxSize={"44"} />,
    scissors: <ScissorsIcon boxSize={"48"} />,
  }
  const checked = value === selectedValue
  return (
    <Flex
      onClick={() => {
        if (!lockedIn) setSelectedValue(value)
      }}
      aria-disabled={lockedIn}
      aria-checked={checked}
      cursor={lockedIn ? "not-allowed" : "pointer"}
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
      px={5}
      py={3}
      alignItems="center"
      justifyContent={"center"}
    >
      {icons[value]}
    </Flex>
  )
}
