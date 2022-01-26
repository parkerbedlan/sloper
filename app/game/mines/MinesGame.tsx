import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Input,
  Text,
} from "@chakra-ui/react"
import { MineIcon } from "app/core/components/icons/MineIcon"
import { SocketOrUndefined } from "app/zustand/hooks/useSocketStore"
import {
  MinesPreset,
  minesPresets,
  MinesRoomData,
  MinesSquareOption,
} from "fullstackUtils/internal"
import React, { useEffect, useState } from "react"
import { CloseIcon } from "@chakra-ui/icons"
import { Image } from "blitz"
import useWindowDimensions from "app/core/hooks/useWindowDimensions"

type MinesGameProps = { room: MinesRoomData; socket: SocketOrUndefined }

export const MinesGame: React.FC<MinesGameProps> = ({ room, socket }) => {
  const [selectedPreset, setSelectedPreset] = useState<MinesPreset | undefined>(undefined)

  const [customSettings, setCustomSettings] = useState<
    { width: number; height: number; numberOfBombs: number } | undefined
  >(undefined)

  useEffect(() => {
    setSelectedPreset(room.settings.preset)
  }, [room.settings.preset])

  useEffect(() => {
    if (room.settings) {
      const { height, width, numberOfBombs } = room.settings
      setCustomSettings({ height, width, numberOfBombs })
    }
  }, [room.settings])

  useEffect(() => {
    if (room.gameStatus === "won") {
      alert(`Congrats, you won!\nTime: ${room.timer}\nClicks: ${room.board.numberOfClicks}`)
    } else if (room.gameStatus === "lost") {
      alert(`Rip you lost, gg.`)
    }
  }, [room.gameStatus, room.timer, room.board.numberOfClicks])

  const { width, height } = useWindowDimensions()
  const aspectRatio = width / height

  const squareSideLength =
    room.settings.width / room.settings.height < aspectRatio
      ? `${Math.floor(100 / room.settings.height)}vh`
      : `${Math.floor(100 / room.settings.width)}vw`

  return (
    <>
      <Flex>
        <Grid
          templateColumns={`repeat(${room.settings.width}, ${squareSideLength})`}
          templateRows={`repeat(${room.settings.height}, ${squareSideLength})`}
        >
          {room.board.squares.map((value, squareNum) => {
            const handleClick = (e: any) => {
              e.preventDefault()
              if (e.type === "click") {
                socket?.emit("mines-left-click", squareNum)
              } else if (e.type === "contextmenu") {
                socket?.emit("mines-right-click", squareNum)
              }
            }

            return <Square key={squareNum} value={value} onClick={handleClick} />
          })}
        </Grid>{" "}
        <Flex direction="column" m={2}>
          <Text>Bombs left: {room.board.bombCounter}</Text>
          <Text mb={4}>Time passed: {room.timer}</Text>
          <Button
            onClick={() => {
              socket?.emit("mines-reset-board")
            }}
            mb={2}
          >
            Reset
          </Button>
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                Settings
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Flex direction="column">
                  <SettingsRadioGroup
                    selectedValue={selectedPreset}
                    setSelectedValue={(value: MinesPreset) => {
                      setSelectedPreset(value)
                      if (value !== "custom") {
                        socket?.emit("mines-change-settings", { preset: value })
                      }
                    }}
                    lockedIn={false}
                  />
                  {selectedPreset === "custom" && (
                    <Box my={4}>
                      <CustomSettingsForm
                        {...{ customSettings, setCustomSettings }}
                        onSubmit={() => {
                          console.log("awefoijfaweoijfaew", {
                            preset: selectedPreset,
                            ...customSettings,
                          })
                          socket?.emit("mines-change-settings", {
                            preset: selectedPreset,
                            ...customSettings,
                          })
                        }}
                      />
                    </Box>
                  )}
                </Flex>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Flex>
      </Flex>
    </>
  )
}

const Square: React.FC<{ value: MinesSquareOption; onClick: (e: any) => void }> = ({
  value,
  onClick,
}) => {
  const valueToDisplay = {
    _: undefined,
    0: undefined,
    bomb: <MineIcon w={"100%"} h={"100%"} />,
    blownup: <MineIcon w={"100%"} h={"100%"} />,
    wrong: (
      <Flex position="relative" alignItems="center" justifyContent={"center"}>
        <CloseIcon w={"100%"} h={"100%"} color="red" position="absolute" top="0%" left="0%" />
        <MineIcon w={"100%"} h={"100%"} />
      </Flex>
    ),
    flag: (
      <Flex justifyContent="center" alignItems={"center"}>
        <Image src="/flag.png" width="30%" height="30%" alt="flag" />
      </Flex>
    ),
    "?": <Text fontSize="3xl">?</Text>,
  }

  const display =
    value in valueToDisplay ? valueToDisplay[value] : <Text fontSize="2xl">{value}</Text>

  return (
    <GridItem
      boxShadow={"md"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      onClick={onClick}
      onContextMenu={onClick}
      cursor="default"
      border="1px"
      // borderColor={"gray.400"}
      bgColor={typeof value === "number" ? "gray.400" : value === "blownup" ? "red" : "gray.200"}
      userSelect={"none"}
    >
      {display}
    </GridItem>
  )
}

const SettingsRadioGroup = ({ selectedValue, setSelectedValue, lockedIn }) => {
  return (
    <>
      <Flex justifyContent={"space-around"} direction="column">
        {minesPresets.map((value) => {
          return (
            <SettingsRadio
              key={value}
              {...{ value, selectedValue, disabled: lockedIn }}
              onClick={() => {
                setSelectedValue(value)
                if (value !== "custom") {
                }
              }}
            />
          )
        })}
      </Flex>
    </>
  )
}

const SettingsRadio = ({ value, selectedValue, onClick, disabled }) => {
  const checked = value === selectedValue
  return (
    <Flex
      onClick={() => {
        if (!disabled && !checked) {
          onClick()
        }
      }}
      aria-disabled={disabled}
      aria-checked={checked}
      cursor={disabled ? "not-allowed" : "pointer"}
      borderWidth="1px"
      borderRadius="md"
      boxShadow="md"
      _disabled={{ opacity: 0.5 }}
      _checked={{
        bg: "blue.500",
        color: "white",
        borderColor: "blue.500",
      }}
      _focus={{
        boxShadow: "outline",
      }}
      alignItems="center"
      justifyContent={"center"}
      p={2}
    >
      {value}
    </Flex>
  )
}

const CustomSettingsForm: React.FC<{
  customSettings:
    | {
        width: number
        height: number
        numberOfBombs: number
      }
    | undefined
  setCustomSettings: React.Dispatch<
    React.SetStateAction<
      | {
          width: number
          height: number
          numberOfBombs: number
        }
      | undefined
    >
  >
  onSubmit: () => void
}> = ({ customSettings, setCustomSettings, onSubmit }) => {
  return (
    <Box>
      <Text textColor="red" fontSize="xs" mb={2}>
        Warning: Custom settings can get pretty glitchy.
      </Text>
      <Flex alignItems="center">
        <Text mr={2}>Width:</Text>
        <Input
          type="number"
          value={customSettings?.width}
          size="sm"
          onChange={(e) => {
            const realValue = Math.min(parseInt(e.target.value.replace(/\D/g, "")), 200)
            setCustomSettings((settings) => ({ ...settings!, width: realValue }))
          }}
        />
      </Flex>
      <Flex alignItems="center">
        <Text mr={2}>Height:</Text>
        <Input
          type="number"
          value={customSettings?.height}
          size="sm"
          onChange={(e) => {
            const realValue = Math.min(parseInt(e.target.value.replace(/\D/g, "")), 200)
            setCustomSettings((settings) => ({ ...settings!, height: realValue }))
          }}
        />
      </Flex>
      <Flex alignItems="center">
        <Text mr={2}>Bombs:</Text>
        <Input
          type="number"
          value={customSettings?.numberOfBombs}
          size="sm"
          onChange={(e) => {
            const realValue = Math.min(parseInt(e.target.value.replace(/\D/g, "")), 200)
            setCustomSettings((settings) => ({ ...settings!, numberOfBombs: realValue }))
          }}
        />
      </Flex>
      <Flex justifyContent={"center"} alignItems={"center"}>
        <Button colorScheme={"blue"} onClick={onSubmit}>
          Submit
        </Button>
      </Flex>
    </Box>
  )
}

const CustomSettingsField = () => {}
