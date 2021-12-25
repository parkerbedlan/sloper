import { useMutation, validateZodSchema, useQuery, useRouter } from "blitz"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form, FORM_ERROR } from "app/core/components/Form"
import signup from "app/auth/mutations/signup"
import { Signup } from "app/auth/validations"
import { Field, Formik, useField, useFormikContext } from "formik"
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react"
import { ChangeEvent, useEffect, useState } from "react"
import checkRoomCode from "app/rooms/mutations/checkRoomCode"

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const router = useRouter()

  const [code, setCode] = useState("")
  const [name, setName] = useState("")

  const [errors, setErrors] = useState({ code: "", name: "" })
  useEffect(() => {
    setErrors((errors) => ({ name: errors.name, code: "" }))
  }, [code])
  useEffect(() => {
    setErrors((errors) => ({ code: errors.code, name: "" }))
  }, [name])

  const [signupMutation] = useMutation(signup)

  const [isRoomReady, setIsRoomReady] = useState<boolean | undefined>(undefined)
  const [checkRoomCodeQuery] = useMutation(checkRoomCode)
  useEffect(() => {
    if (code.length < 4) return setIsRoomReady(undefined)
    ;(async () => {
      setIsRoomReady(await checkRoomCodeQuery({ code }))
    })()
  }, [code, checkRoomCodeQuery])

  const handleSubmit = async () => {
    const validationErrors = await validateZodSchema(Signup)({ name, code })
    setErrors(validationErrors)
    if (!isRoomReady || validationErrors["code"] || validationErrors["name"]) return
    console.log("submitting")
    try {
      const response = await signupMutation({ name, code, role: "PLAYER" })
      router.push(`/${code}`)
    } catch (error: any) {
      const [field, message] = error.message.split(": ")
      if (field === "code" || field === "name") setErrors({ ...errors, [field]: message })
    }
  }

  return (
    <>
      <FormControl isInvalid={!!errors["code"]}>
        <FormLabel>
          <Flex justifyContent={"space-between"}>
            <Text>ROOM CODE</Text>
            <Text>
              <i>
                {isRoomReady === undefined ? "" : isRoomReady ? "Ready to join!" : "Room not found"}
              </i>
            </Text>
          </Flex>
        </FormLabel>
        <Input
          autoCapitalize="characters"
          placeholder={"ENTER 4-LETTER CODE"}
          value={code}
          onChange={(e) => {
            const newCode = e.target.value.toUpperCase().substring(0, 4)
            setCode(newCode)
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSubmit()
          }}
        />
        {errors["code"] && <FormErrorMessage>{errors["code"]}</FormErrorMessage>}
      </FormControl>
      <NameField {...{ name, setName }} errorMessage={errors["name"]} onEnter={handleSubmit} />
      <Flex justifyContent={"center"} mt={4}>
        <Button w={"80%"} colorScheme={"blue"} disabled={!isRoomReady} onClick={handleSubmit}>
          JOIN ROOM
        </Button>
      </Flex>
    </>
  )
}

export const NameField = ({
  name,
  setName,
  errorMessage,
  onEnter,
}: {
  name: string
  setName: React.Dispatch<React.SetStateAction<string>>
  errorMessage?: string
  onEnter?: () => void
}) => {
  return (
    <FormControl mt={6} isInvalid={!!errorMessage}>
      <FormLabel>
        <Flex justifyContent={"space-between"}>
          <Text>NAME</Text>
          <Text>{12 - name.length}</Text>
        </Flex>
      </FormLabel>
      <Input
        placeholder={"ENTER YOUR NAME"}
        value={name}
        onChange={(e) => {
          setName(e.target.value.toUpperCase().substring(0, 12))
        }}
        onKeyPress={(e) => {
          if (e.key === "Enter" && onEnter) onEnter()
        }}
      />
      {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
    </FormControl>
  )
}

export default SignupForm
