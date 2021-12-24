import { code, name } from "app/auth/validations"
import { resolver } from "blitz"
import db from "db"
import { number, z } from "zod"

const CreateRoom = z.object({
  name,
  code,
  hostId: z.number(),
})

export default resolver.pipe(resolver.zod(CreateRoom), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const room = await db.room.create({ data: { ...input, isFull: false } })

  return room
})
