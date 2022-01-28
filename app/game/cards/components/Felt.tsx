import { Flex } from "@chakra-ui/react"
import React from "react"

export const Felt: React.FC<React.ComponentProps<typeof Flex>> = ({ children, ...props }) => {
  return (
    <Flex
      justifyContent="center"
      alignItems={"center"}
      direction="column"
      py={"8rem"}
      bgColor="green.600"
      h="100vh"
      {...props}
    >
      {children}
    </Flex>
  )
}
