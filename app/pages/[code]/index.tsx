import React from "react"
import { BlitzPage, Routes, useParam, useRouter } from "blitz"
import Layout from "app/core/layouts/Layout"
import { Wrapper } from "app/core/components/Wrapper"
import { Text } from "@chakra-ui/react"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"

const Room: BlitzPage = () => {
  const router = useRouter()
  const code = useParam("code", "string")!
  const currentUser = useCurrentUser()
  if (!currentUser) router.push(Routes.Name({ code }))

  return (
    <>
      <Wrapper>
        <Text>Lobby Page</Text>
        <pre>{JSON.stringify(currentUser, null, 2)}</pre>
      </Wrapper>
    </>
  )
}

Room.suppressFirstRenderFlicker = true
Room.getLayout = (page) => <Layout title="Room">{page}</Layout>

export default Room
