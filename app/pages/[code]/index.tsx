import { ChevronRightIcon } from "@chakra-ui/icons"
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { CloseIcon } from "app/core/components/icons/CloseIcon"
import { SendIcon } from "app/core/components/icons/SendIcon"
import { JsonDump } from "app/core/components/JsonDump"
import { Wrapper } from "app/core/components/Wrapper"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Layout from "app/core/layouts/Layout"
import deleteUser from "app/rooms/mutations/deleteUser"
import { BlitzPage, Routes, useMutation, useRouter } from "blitz"
import { Message, playerCaps, playerMins } from "fullstackUtils/internal"
import React, { useEffect, useRef, useState } from "react"
import { useRoomState } from "../../core/hooks/useRoomState"
import Page404 from "../404"

const RoomPage: BlitzPage = () => {
  const [room, socket, roomStatus] = useRoomState()

  const router = useRouter()
  const currentUser = useCurrentUser()

  useEffect(() => {
    if (roomStatus === "success" && room!.status === "game" && room!.code) {
      router.push(Routes.Game({ code: room!.code }))
    }
  }, [roomStatus, room, room?.status, room?.code, router])

  const [deleteUserMutation] = useMutation(deleteUser)

  if (roomStatus === "404") return <Page404 />
  if (roomStatus === "loading" || !room) return <Text>Loading...</Text>
  if (room?.status === "game") return <Text>Redirecting...</Text>

  const playerMinMet = room.players.length >= playerMins[room.gameType!]

  return (
    <>
      <Wrapper>
        <Flex alignItems="flex-end" justifyContent={"space-between"} wrap="nowrap">
          <Box>
            <ClickableCode code={room.code} />
            <Text>Game: {room.gameType}</Text>
          </Box>
          {currentUser!.role === "HOST" && (
            <Box mb={1}>
              <Button
                colorScheme={"green"}
                rightIcon={<ChevronRightIcon />}
                onClick={() => socket?.emit("start-game")}
                disabled={!playerMinMet}
              >
                START GAME
              </Button>
            </Box>
          )}
        </Flex>
        <hr />
        <Text>
          Players: ({room.players.length}/{playerCaps[room.gameType as keyof typeof playerCaps]})
        </Text>
        {room.players.map((player) => (
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
                    await deleteUserMutation({ id: player.id, code: room.code })
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
            messages={room.messages}
            onSend={(text) => {
              const message: Message = {
                authorName: currentUser!.name,
                roomCode: room.code,
                text,
              }
              socket?.emit("new-message", message)
            }}
          />
        </Box>
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
