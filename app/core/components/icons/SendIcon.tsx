import { Icon } from "@chakra-ui/react"

export const SendIcon: React.FC<React.ComponentProps<typeof Icon>> = (props) => (
  <Icon height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF" {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </Icon>
)
