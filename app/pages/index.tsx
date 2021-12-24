import { Suspense } from "react"
import { Image, Link, BlitzPage, useMutation, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import logout from "app/auth/mutations/logout"
import logo from "public/logo.png"
import { Wrapper } from "app/core/components/Wrapper"
import { Box, Button, Flex } from "@chakra-ui/react"
import SignupForm from "app/auth/components/SignupForm"

/*
 * This file is just for a pleasant getting started page for your new app.
 * You can delete everything in here and start from scratch if you like.
 */

const Home: BlitzPage = () => {
  return (
    <Wrapper variant="small">
      <Flex direction="column">
        <Box borderBottom="1px" py={10}>
          <Flex justifyContent={"center"}>
            <Button w={"80%"} colorScheme={"blue"}>
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
