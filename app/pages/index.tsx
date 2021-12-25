import { Box, Button, Flex } from "@chakra-ui/react"
import SignupForm from "app/auth/components/SignupForm"
import { Wrapper } from "app/core/components/Wrapper"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Layout from "app/core/layouts/Layout"
import { BlitzPage, Routes, useRouter } from "blitz"

/*
 * This file is just for a pleasant getting started page for your new app.
 * You can delete everything in here and start from scratch if you like.
 */

const Home: BlitzPage = () => {
  const router = useRouter()
  const currentUser = useCurrentUser()
  return (
    <Wrapper variant="small">
      <Flex direction="column">
        {/* <pre>{JSON.stringify(currentUser, null, 2)}</pre> */}
        <Box borderBottom="1px" py={10}>
          <Flex justifyContent={"center"}>
            <Button w={"80%"} colorScheme={"blue"} onClick={() => router.push(Routes.CreateRoom())}>
              CREATE ROOM
            </Button>
          </Flex>
        </Box>
        <Box py={10}>
          <SignupForm />
        </Box>
      </Flex>
    </Wrapper>
  )
}

const JoinForm = () => {
  return <SignupForm />
}

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
