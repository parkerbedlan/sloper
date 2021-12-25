import React from "react"
import { BlitzPage, Routes, useParam, useRouter } from "blitz"
import Layout from "app/core/layouts/Layout"
import { Wrapper } from "app/core/components/Wrapper"
import { Text } from "@chakra-ui/react"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"

const Name: BlitzPage = () => {
  const router = useRouter()

  const code = useParam("code", "string")!
  if (code) {
    const codeAllCaps = code.toUpperCase()
    if (code !== codeAllCaps) router.push(Routes.Name({ code: codeAllCaps }))
  }

  const currentUser = useCurrentUser()
  if (currentUser) {
    router.push(Routes.Room({ code }))
  }

  return (
    <>
      <Wrapper variant="small">
        <pre>{JSON.stringify(currentUser, null, 2)}</pre>
        <Text>Name Page</Text>
      </Wrapper>
    </>
  )
}

Name.suppressFirstRenderFlicker = true
Name.getLayout = (page) => <Layout title="Name">{page}</Layout>

export default Name
