import React, { useEffect, useState } from "react"
import { BlitzPage, Routes, useRouter } from "blitz"
import Layout from "app/core/layouts/Layout"
import { Wrapper } from "app/core/components/Wrapper"
import {
  Box,
  Button,
  Flex,
  IconButton,
  Text,
  useRadio,
  useRadioGroup,
  UseRadioProps,
} from "@chakra-ui/react"
import { useRoomState } from "../../core/hooks/useRoomState"
import Page404 from "../404"
import { ScissorsIcon } from "app/core/components/icons/ScissorsIcon"
import { RockIcon } from "app/core/components/icons/RockIcon"
import { PaperIcon } from "app/core/components/icons/PaperIcon"
import { RoomState, RPSChoice, rpsChoices } from "fullstackUtils"
import { SocketOrUndefined } from "app/zustand/hooks/useSocketStore"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { useStatePersist } from "app/zustand/zustandTools"

const Game: BlitzPage = () => {
  const [roomState, socket, roomStatus] = useRoomState()

  const router = useRouter()
  useEffect(() => {
    if (roomState.status === "lobby" && roomState.code) {
      router.push(Routes.RoomPage({ code: roomState.code }))
    }
  }, [roomState.status, roomState.code, router])

  if (roomStatus === "404") return <Page404 />
  if (roomStatus === "loading") return <Text>Loading...</Text>

  if (roomState.status === "lobby") return <Text>Redirecting...</Text>

  return (
    <>
      <Wrapper>
        <RPSGame {...{ roomState, socket }} />
      </Wrapper>
    </>
  )
}

Game.suppressFirstRenderFlicker = true
Game.getLayout = (page) => <Layout title="Game">{page}</Layout>

export default Game

const RPSGame: React.FC<{ roomState: RoomState; socket: SocketOrUndefined }> = ({
  roomState,
  socket,
}) => {
  const currentUser = useCurrentUser()!
  // const [currentChoice, setCurrentChoice] = useState<RPSChoice | undefined>(undefined)
  const [currentChoice, setCurrentChoice] = useStatePersist<RPSChoice | undefined>(
    undefined,
    "currentChoice",
    true
  )

  const [lockedIn, setLockedIn] = useState<boolean>(false)

  if (roomState.gameType === "Tic Tac Toe") throw Error("wrong game type")

  const board = roomState.board!
  const choices = board.choices
  const classifiedChoices = {
    ...choices,
    [currentUser.name]:
      choices[currentUser.name] === "private" ? currentChoice : choices[currentUser.name],
  }

  const score = board.score

  useEffect(() => {
    setLockedIn(false)
  }, [score])

  return (
    <>
      <pre>{JSON.stringify(classifiedChoices, null, 2)}</pre>
      <pre>{JSON.stringify(score, null, 2)}</pre>
      <RPSRadioGroup {...{ currentChoice, setCurrentChoice, lockedIn }} />
      <Flex justifyContent={"flex-end"} m={4}>
        <Button
          colorScheme={"blue"}
          disabled={!currentChoice || lockedIn}
          onClick={() => {
            console.log("choosing", currentChoice)
            socket?.emit("rps-choose", { choice: currentChoice, playerName: currentUser.name })
            setLockedIn(true)
          }}
        >
          Choose
        </Button>
      </Flex>
    </>
  )
}

const RPSRadioGroup = ({ currentChoice, setCurrentChoice, lockedIn }) => {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "currentChoice",
    value: currentChoice,
    onChange: (nextValue) => {
      setCurrentChoice(nextValue as RPSChoice)
    },
  })
  const group = getRootProps()

  return (
    <>
      <Flex justifyContent={"space-around"} {...group}>
        {rpsChoices.map((choice) => {
          const radio = getRadioProps({ value: choice })
          return <RPSRadio key={choice} choice={choice} {...radio} isDisabled={lockedIn} />
        })}
      </Flex>
    </>
  )
}

const RPSRadio: React.FC<{ choice: RPSChoice } & UseRadioProps> = ({
  choice,
  isDisabled,
  ...props
}) => {
  const { getInputProps, getCheckboxProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getCheckboxProps()

  const icons = {
    rock: <RockIcon boxSize={"44"} />,
    paper: <PaperIcon boxSize={"44"} />,
    scissors: <ScissorsIcon boxSize={"48"} />,
  }

  return (
    <Box as="label">
      <input {...input} disabled={isDisabled} />
      <Flex
        disabled={isDisabled}
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          bg: "blue.500",
          color: "white",
          borderColor: "blue.500",
        }}
        _focus={{
          boxShadow: "outline",
        }}
        _disabled={{
          opacity: 0.5,
        }}
        w={"52"}
        h={"52"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        {icons[choice]}
      </Flex>
    </Box>
  )
}
