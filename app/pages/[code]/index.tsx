import {
  Box,
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
import { SendIcon } from "app/core/components/icons/SendIcon"
import { Wrapper } from "app/core/components/Wrapper"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Layout from "app/core/layouts/Layout"
import getRoom from "app/rooms/queries/getRoom"
import { BlitzPage, Routes, useParam, useQuery, useRouter } from "blitz"
import React, { useEffect, useState } from "react"

const Room: BlitzPage = () => {
  const router = useRouter()

  const code = useParam("code", "string")!
  if (code) {
    if (code.length !== 4) router.push(Routes.Home())
    const codeAllCaps = code.toUpperCase()
    if (code !== codeAllCaps) router.push(Routes.Room({ code: codeAllCaps }))
  }

  const currentUser = useCurrentUser()
  if (!currentUser || currentUser.room.code !== code) {
    router.push(Routes.Name({ code }))
  }

  const [room] = useQuery(getRoom, { code })

  return (
    <>
      <Wrapper>
        {/* <pre>{JSON.stringify(currentUser, null, 2)}</pre> */}
        <ClickableCode code={code} />
        <Text>Game: {room.gameType}</Text>
        <hr />
        <Text>Players:</Text>
        {room.players.map((player) => (
          <Text key={player.id} fontWeight={player.id === currentUser!.id ? "bold" : undefined}>
            {player.name} {player.role === "HOST" && <i>(Host)</i>}
          </Text>
        ))}
        <hr />
        <Box mt={4}>
          <Chatbox />
        </Box>
      </Wrapper>
    </>
  )
}

const Chatbox = () => {
  const [newMessage, setNewMessage] = useState("")
  return (
    <>
      <Flex border="1px" overflowY={"scroll"} flexDirection="column-reverse" h={60}>
        <Stack>
          {[...Array(100)].map((_, i) => (
            <Text key={i}>
              <b>JIMMY: </b>
              {i}
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

Room.suppressFirstRenderFlicker = true
Room.getLayout = (page) => <Layout title="Room">{page}</Layout>

export default Room
