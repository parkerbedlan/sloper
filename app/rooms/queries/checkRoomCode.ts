import { code } from "app/auth/validations"
import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CheckRoomCode = z.object({
  code: code,
})

export default resolver.pipe(resolver.zod(CheckRoomCode), async ({ code }) => {
  const room = await db.room.findFirst({ where: { code } })
  // if (code === "ASDF") return true
  return !!room
})
