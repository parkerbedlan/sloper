import signup from "app/auth/mutations/signup"
import { gameType, name } from "app/auth/validations"
import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CreateRoom = z.object({
  name,
  gameType,
})

export default resolver.pipe(resolver.zod(CreateRoom), async ({ name, gameType }, ctx) => {
  // delete day+ old rooms first
  await db.room.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 86400000) } } })

  let randomCode: string
  let oldRoom: { id: number } | null
  do {
    randomCode = generateRandomCode()
    oldRoom = await db.room.findFirst({ where: { code: randomCode }, select: { id: true } })
  } while (oldRoom)

  const room = await db.room.create({
    data: { code: randomCode, gameType, hostId: -1, isFull: false },
  })

  await signup({ code: randomCode, name, role: "HOST" }, ctx)

  return room
})

const generateRandomCode = () =>
  [...Array(4)].map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("")
