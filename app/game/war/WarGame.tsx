import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { BlitzChakraLink } from "app/core/components/BlitzChakraLink"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { SocketOrUndefined } from "app/zustand/hooks/useSocketStore"
import { Routes } from "blitz"
import { WarRoomData } from "fullstackUtils/war"
import React, { useEffect } from "react"
import { CardPile } from "../cards/components/CardPile"
import { Felt } from "../cards/components/Felt"
import { OpponentHands } from "../cards/components/OpponentHands"
import { PlayerHand } from "../cards/components/PlayerHand"

type WarGameProps = { room: WarRoomData; socket: SocketOrUndefined }

export const WarGame: React.FC<WarGameProps> = ({ room, socket }) => {
  const currentUser = useCurrentUser()!

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    const playedLengths = Object.values(room.board.playerCards).map(
      (playerCard) => playerCard.played.length
    )
    if (
      room.gameStatus === "in progress" &&
      playedLengths[0] === playedLengths[1] &&
      playedLengths[0]! > 0
    ) {
      alert("WAR!")
    }
  }, [room.gameStatus, room.board.playerCards])

  // useEffect(() => {
  //   let interval
  //   if (room.gameStatus !== "finished") {
  //     interval = setInterval(() => {
  //       socket?.emit("war-flip")
  //       console.log("pog")
  //     }, 250)
  //   }
  //   return () => {
  //     clearInterval(interval)
  //   }
  // }, [room.gameStatus, socket])

  useEffect(() => {
    if (room.gameStatus === "finished") {
      onOpen()
    } else if (room.gameStatus === "ready") {
      onClose()
    }
  }, [room.gameStatus, onOpen, onClose])

  const playerNames = Object.keys(room.board.playerCards)
  const otherPlayerName = playerNames.find((name) => name !== currentUser.name)!
  return (
    <>
      <OpponentHands
        hands={{ [otherPlayerName]: room.board.playerCards[otherPlayerName]!.hand.length }}
      />
      <PlayerHand
        amount={room.board.playerCards[currentUser.name]?.hand.length}
        onClick={() => {
          socket?.emit("war-flip")
        }}
      />
      <Felt>
        <CardPile
          cardValues={room.board.playerCards[otherPlayerName]?.played.map((cardValue, i) => {
            const realCardValue = i % 2 === 1 ? undefined : cardValue
            return realCardValue
          })}
          spaced
        />
        <CardPile
          cardValues={room.board.playerCards[currentUser.name]?.played.map((cardValue, i) => {
            const realCardValue = i % 2 === 1 ? undefined : cardValue
            return realCardValue
          })}
          spaced
        />
        {room.gameStatus === "wait" && (
          <Spinner
            thickness="4px"
            speed="1s"
            emptyColor="gray.500"
            color="green.800"
            size="xl"
            position="fixed"
            top="50%"
            left="20%"
          />
        )}
        <Modal isOpen={isOpen} onClose={() => {}}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Modal Title</ModalHeader>
            <ModalBody>
              <Text>{room.board.winner} won!</Text>
              <Text>
                {room.board.winner === currentUser.name ? "Great job!" : "Better luck next time!"}
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() => {
                  socket?.emit("war-reset")
                  onClose()
                }}
              >
                Play Again
              </Button>
              <BlitzChakraLink href={Routes.Home()} color="unset">
                <Button>Play a different game</Button>
              </BlitzChakraLink>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Felt>
    </>
  )
}
