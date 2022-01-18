import {
  Box,
  Button,
  Flex,
  HStack,
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
import { Wrapper } from "app/core/components/Wrapper"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Layout from "app/core/layouts/Layout"
import deleteUser from "app/rooms/mutations/deleteUser"
import checkRoomCode from "app/rooms/queries/checkRoomCode"
import getRoom from "app/rooms/queries/getRoom"
import { BlitzPage, Routes, useMutation, useParam, useQuery, useRouter } from "blitz"
import React, { useEffect, useState } from "react"
import Page404 from "../404"
import { useSocketConnect } from "../../zustand/hooks/useSocketConnect"
import { User } from "@prisma/client"
import { initialRoomState, Message, roomReducer, RoomState } from "fullstackUtils"

const RoomPage: BlitzPage = () => {
  const router = useRouter()

  const code = useParam("code", "string")!
  if (code) {
    if (code.length !== 4) router.push(Routes.Home())
    const codeAllCaps = code.toUpperCase()
    if (code !== codeAllCaps) router.push(Routes.Room({ code: codeAllCaps }))
  }

  const currentUser = useCurrentUser()
  const [deleteUserMutation] = useMutation(deleteUser)

  const [room, { refetch: refetchRoom }] = useQuery(getRoom, { code }, { enabled: false })

  const [roomExists] = useQuery(checkRoomCode, { code })

  useEffect(() => {
    if (!currentUser || currentUser.room.code !== code) {
      router.push(Routes.Name({ code }))
      // return <Text>Redirecting...</Text>
    } else if (!room) {
      refetchRoom()
    }
  }, [roomExists, currentUser, room, code, router, refetchRoom])

  const [roomState, setRoomState] = useState<RoomState>(initialRoomState)

  const socket = useSocketConnect({ roomCode: code, currentUser: JSON.stringify(currentUser) }, [
    {
      on: "connected",
      listener: (data: RoomState) => {
        setRoomState(data)
      },
    },
    {
      on: "new-player-remote",
      listener: (data: User) => {
        console.log("new-player-remote", data)
        setRoomState((roomState) => roomReducer(roomState, "new-player", data))
      },
    },
    {
      on: "new-message-remote",
      listener: (data: Message) => {
        console.log("new-message-remote", data)
        setRoomState((roomState) => roomReducer(roomState, "new-message", data))
      },
    },
  ])

  // useEffect(() => {
  //   console.log("roomState", roomState)
  // }, [roomState])

  if (!roomExists) return <Page404 />
  if (!room) return <Text>Loading...</Text>

  return (
    <>
      {/* <pre>{JSON.stringify(roomState, null, 2)}</pre> */}
      <pre>{roomState.messages.length}</pre>
      <Wrapper>
        {/* <pre>{JSON.stringify(currentUser, null, 2)}</pre> */}
        <ClickableCode code={code} />
        <Text>Game: {room.gameType}</Text>
        <hr />
        <Text>Players:</Text>
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
                    await deleteUserMutation({ id: player.id, roomId: room.id })
                    await refetchRoom()
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
          <Chatbox messages={roomState.messages} />
        </Box>
        <Button
          onClick={() => {
            const testMessage: Message = {
              authorName: currentUser!.name,
              roomCode: code,
              text: "hi",
            }
            socket?.emit("new-message", testMessage)
          }}
        >
          say hi
        </Button>
      </Wrapper>
    </>
  )
}

const Chatbox: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const [newMessage, setNewMessage] = useState("")
  return (
    <>
      <Flex border="1px" overflowY={"scroll"} flexDirection="column-reverse" h={60}>
        <Stack>
          {/* {[...Array(100)].map((_, i) => (
            <Text key={i}>
              <b>JIMMY: </b>
              {i}
            </Text>
          ))} */}
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
          onChange={(e) => setNewMessage(e.target.value.substring(0, 200))}
        />
        <InputRightAddon as={IconButton} type="submit" bgColor="blue.400">
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
