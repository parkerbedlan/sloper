import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { User } from "@prisma/client"
import { CloseIcon } from "app/core/components/icons/CloseIcon"
import { SendIcon } from "app/core/components/icons/SendIcon"
import { Wrapper } from "app/core/components/Wrapper"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Layout from "app/core/layouts/Layout"
import deleteUser from "app/rooms/mutations/deleteUser"
import checkRoomCode from "app/rooms/queries/checkRoomCode"
import getRoom from "app/rooms/queries/getRoom"
import { BlitzPage, Routes, useMutation, useParam, useQuery, useRouter } from "blitz"
import { actionTypes, initialRoomState, Message, roomReducer, RoomState } from "fullstackUtils"
import React, { useEffect, useRef, useState } from "react"
import { useSocketConnect } from "../../zustand/hooks/useSocketConnect"
import Page404 from "../404"
import { ChevronRightIcon } from "@chakra-ui/icons"
import { useRoomState } from "../../core/hooks/useRoomState"

const RoomPage: BlitzPage = () => {
  const [roomState, socket, roomStatus] = useRoomState()

  const router = useRouter()
  const currentUser = useCurrentUser()

  useEffect(() => {
    if (roomState.status === "game" && roomState.code)
      router.push(Routes.Game({ code: roomState.code }))
  }, [roomState.status, roomState.code, router])

  const [deleteUserMutation] = useMutation(deleteUser)

  if (roomStatus === "404") return <Page404 />
  if (roomStatus === "loading") return <Text>Loading...</Text>

  return (
    <>
      {/* <pre>{roomState.messages.length}</pre> */}
      <Wrapper>
        <Flex alignItems="flex-end" justifyContent={"space-between"} wrap="nowrap">
          <Box>
            <ClickableCode code={roomState.code} />
            <Text>Game: {roomState.gameType}</Text>
          </Box>
          {currentUser!.role === "HOST" && (
            <Box mb={1}>
              <Button
                colorScheme={"green"}
                rightIcon={<ChevronRightIcon />}
                onClick={() => socket?.emit("start-game")}
              >
                START GAME
              </Button>
            </Box>
          )}
        </Flex>

        <hr />
        <Text>Players:</Text>
        {roomState.players.map((player) => (
          <Flex key={player.id} alignItems="center">
            {currentUser?.role === "HOST" && player.id !== currentUser!.id && (
              <IconButton
                icon={<CloseIcon color="red" />}
                aria-label="remove user"
                size={"xs"}
                variant={"outline"}
                colorScheme="red"
                onClick={async () => {
                  if (
                    window.confirm(`Are you sure you want to remove ${player.name} from the room?`)
                  ) {
                    // await deleteUserMutation({ id: player.id, roomId: room.id })
                    await deleteUserMutation({ id: player.id, code: roomState.code })
                    socket?.emit("kicked-player", player.id)
                    // await refetchRoom()
                  }
                }}
              />
            )}
            <Text fontWeight={player.id === currentUser!.id ? "bold" : undefined}>
              {player.name} {player.role === "HOST" && <i>(Host)</i>}
            </Text>
          </Flex>
        ))}
        <hr />
        <Box mt={4}>
          <Chatbox
            messages={roomState.messages}
            onSend={(text) => {
              const message: Message = {
                authorName: currentUser!.name,
                roomCode: roomState.code,
                text,
              }
              socket?.emit("new-message", message)
            }}
          />
        </Box>
        <pre>{JSON.stringify(roomState, null, 2)}</pre>
      </Wrapper>
    </>
  )
}

const Chatbox: React.FC<{ messages: Message[]; onSend: (text: string) => void }> = ({
  messages,
  onSend,
}) => {
  const [newMessage, setNewMessage] = useState("")
  const inputField = useRef<HTMLInputElement>()

  return (
    <>
      <Flex border="1px" overflowY={"scroll"} flexDirection="column-reverse" h={60}>
        <Stack>
          {messages.map((message, i) => (
            <Text key={i}>
              <b>{message.authorName}: </b>
              {message.text}
            </Text>
          ))}
        </Stack>
      </Flex>
      <InputGroup>
        <Input
          value={newMessage}
          ref={inputField as any}
          onChange={(e) => setNewMessage(e.target.value.substring(0, 200))}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              onSend(newMessage)
              setNewMessage("")
            }
          }}
        />
        <InputRightAddon
          as={IconButton}
          type="submit"
          bgColor="blue.400"
          onClick={() => {
            onSend(newMessage)
            setNewMessage("")
            inputField.current?.focus()
          }}
        >
          <SendIcon />
        </InputRightAddon>
      </InputGroup>
    </>
  )
}

const ClickableCode = ({ code }: { code: string }) => {
  const [isClicked, setIsClicked] = useState(false)
  useEffect(() => {
    if (isClicked) setTimeout(() => setIsClicked(false), 5000)
  }, [isClicked])
  const label = isClicked ? "Copied ✔" : "Click to copy link"
  return (
    <Tooltip label={label} placement="top-start">
      <Box w="fit-content" mt={12} _hover={{ cursor: "pointer" }}>
        <Text
          onClick={() => {
            navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_ORIGIN}/${code}`)
            setIsClicked(true)
          }}
        >
          Code: {code} {isClicked && " ✔"}
        </Text>
      </Box>
    </Tooltip>
  )
}

RoomPage.suppressFirstRenderFlicker = true
RoomPage.getLayout = (page) => <Layout title="Room">{page}</Layout>

export default RoomPage
