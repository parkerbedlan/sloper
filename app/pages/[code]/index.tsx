import { Text } from "@chakra-ui/react"
import { Wrapper } from "app/core/components/Wrapper"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Layout from "app/core/layouts/Layout"
import { BlitzPage, Routes, useParam, useRouter } from "blitz"
import React from "react"

const Room: BlitzPage = () => {
  const router = useRouter()

  const code = useParam("code", "string")!
  if (code) {
    const codeAllCaps = code.toUpperCase()
    if (code !== codeAllCaps) router.push(Routes.Room({ code: codeAllCaps }))
  }

  const currentUser = useCurrentUser()
  if (!currentUser || currentUser.room.code !== code) {
    router.push(Routes.Name({ code }))
  }

  return (
    <>
      <Wrapper>
        <pre>{JSON.stringify(currentUser, null, 2)}</pre>
        <Text>Lobby Page</Text>
      </Wrapper>
    </>
  )
}

Room.suppressFirstRenderFlicker = true
Room.getLayout = (page) => <Layout title="Room">{page}</Layout>

export default Room
