import { Box, Button, Flex, Text } from "@chakra-ui/react"
import SignupForm from "app/auth/components/SignupForm"
import { JsonDump } from "app/core/components/JsonDump"
import { Wrapper } from "app/core/components/Wrapper"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Layout from "app/core/layouts/Layout"
import { BlitzPage, Routes, useRouter } from "blitz"

const Home: BlitzPage = () => {
  const router = useRouter()

  return (
    <Wrapper variant="small">
      <Flex direction="column">
        <Flex justifyContent={"center"}>
          <Text fontSize={"6xl"} fontFamily={"brand"}>
            s\oper
          </Text>
        </Flex>
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

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
