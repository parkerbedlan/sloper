import React, { useState } from "react"
import { BlitzPage, Routes, useMutation, useParam, useRouter } from "blitz"
import Layout from "app/core/layouts/Layout"
import { Wrapper } from "app/core/components/Wrapper"
import { Text } from "@chakra-ui/react"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { NameSelection } from "../create"
import signup from "app/auth/mutations/signup"

const Name: BlitzPage = () => {
  const router = useRouter()

  const code = useParam("code", "string")!
  if (code) {
    if (code.length !== 4) router.push(Routes.Home())
    const codeAllCaps = code.toUpperCase()
    if (code !== codeAllCaps) router.push(Routes.Name({ code: codeAllCaps }))
  }

  const currentUser = useCurrentUser()
  if (currentUser) {
    router.push(Routes.Room({ code }))
  }

  const [name, setName] = useState("")
  const [signupMutation] = useMutation(signup)
  const handleSubmit = async () => {
    console.log("submitting")
    await signupMutation({ code, name, role: "PLAYER" })
  }

  return (
    <>
      <Wrapper variant="small">
        {/* <pre>{JSON.stringify(currentUser, null, 2)}</pre> */}
        <NameSelection {...{ name, setName }} onSubmit={handleSubmit} />
      </Wrapper>
    </>
  )
}

Name.suppressFirstRenderFlicker = true
Name.getLayout = (page) => <Layout title="Name">{page}</Layout>

export default Name
