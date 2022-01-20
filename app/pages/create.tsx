import React, { useEffect, useState } from "react"
import { BlitzPage, Routes, useMutation, useRouter } from "blitz"
import Layout from "app/core/layouts/Layout"
import { Wrapper } from "app/core/components/Wrapper"
import {
  Box,
  Button,
  Flex,
  Icon,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useRadio,
  useRadioGroup,
} from "@chakra-ui/react"
import { ChessIcon } from "app/core/components/icons/ChessIcon"
import { PrisonerIcon } from "app/core/components/icons/PrisonerIcon"
import { ScissorsIcon } from "app/core/components/icons/ScissorsIcon"
import { TicTacToeIcon } from "app/core/components/icons/TicTacToeIcon"
import signup from "app/auth/mutations/signup"
import createRoom from "app/rooms/mutations/createRoom"
import { NameField } from "app/auth/components/SignupForm"
import { GameType } from "types"
import { useName } from "app/core/hooks/useName"

const gameSelections = [
  { gameName: "Rock Paper Scissors", icon: <ScissorsIcon mr={2} /> },
  { gameName: "Tic Tac Toe", icon: <TicTacToeIcon mr={2} /> },
  // { gameName: "Prisoner's Dilemma", icon: <PrisonerIcon mr={2} /> },
  // { gameName: "Chess", icon: <ChessIcon mr={2} /> },
]

const CreateRoom: BlitzPage = () => {
  const router = useRouter()

  const [gameIndex, setGameIndex] = useState<number | undefined>(undefined)
  const [name, setName] = useName()

  const [createRoomMutation] = useMutation(createRoom)
  const handleSubmit = async () => {
    console.log("submitting")
    const index = gameIndex || 0
    const gameType = gameSelections[index]!.gameName as GameType
    const room = await createRoomMutation({ name, gameType })
    router.push(Routes.RoomPage({ code: room.code }))
  }

  const [formPartIndex, setFormPartIndex] = useState(0)
  const formParts = [
    <GameSelection
      key={0}
      onSubmit={() => setFormPartIndex((i) => i + 1)}
      {...{ gameIndex, setGameIndex }}
    />,
    <NameSelection key={1} {...{ name, setName }} onSubmit={handleSubmit} />,
  ]

  return <Wrapper variant="small">{formParts[formPartIndex]}</Wrapper>
}

const GameSelection = ({
  gameIndex,
  setGameIndex,
  onSubmit,
}: {
  gameIndex: number | undefined
  setGameIndex: React.Dispatch<React.SetStateAction<number | undefined>>
  onSubmit: () => void
}) => {
  const [value, setValue] = useState<number | undefined>(undefined)

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "gameSelection",
    value: gameIndex,
    onChange: (nextValue) => {
      setGameIndex(parseInt(nextValue))
      onSubmit()
    },
  })

  const group = getRootProps()

  return (
    <>
      <Text fontWeight={"bold"} fontSize={"3xl"} my={4}>
        Pick a game:
      </Text>
      <Stack {...group}>
        {gameSelections.map(({ gameName, icon }, index) => {
          const radio = getRadioProps({ value: index })
          return (
            <RadioCard key={index} {...radio}>
              <Flex alignItems="center">
                {icon}
                {gameName}
              </Flex>
            </RadioCard>
          )
        })}
      </Stack>
    </>
  )
}

export const NameSelection = ({
  name,
  setName,
  onSubmit,
}: {
  name: string
  setName: React.Dispatch<React.SetStateAction<string>>
  onSubmit: () => void
}) => {
  return (
    <>
      <Text fontWeight={"bold"} fontSize={"3xl"} my={4}>
        Pick your name:
      </Text>
      <NameField {...{ name, setName }} onEnter={onSubmit} />
      <Flex justifyContent={"flex-end"} m={2}>
        <Button disabled={name.length === 0} onClick={onSubmit}>
          ENTER ROOM
        </Button>
      </Flex>
    </>
  )
}

const RadioCard = (props) => {
  const { getInputProps, getCheckboxProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getCheckboxProps()

  return (
    <Box as="label">
      <input {...input} />
      <Box
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
        px={5}
        py={3}
      >
        {props.children}
      </Box>
    </Box>
  )
}

CreateRoom.suppressFirstRenderFlicker = true
CreateRoom.getLayout = (page) => <Layout title="Create Room">{page}</Layout>

export default CreateRoom
