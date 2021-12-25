import React from "react"
import { BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"
import { Wrapper } from "app/core/components/Wrapper"
import { Text } from "@chakra-ui/react"

const Name: BlitzPage = () => {
  return (
    <>
      <Wrapper>
        <Text>Name Page</Text>
      </Wrapper>
    </>
  )
}

Name.suppressFirstRenderFlicker = true
Name.getLayout = (page) => <Layout title="Name">{page}</Layout>

export default Name
