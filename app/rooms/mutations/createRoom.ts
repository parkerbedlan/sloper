import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CreateRoom = z.object({
  name: z.string(),
})

export default resolver.pipe(resolver.zod(CreateRoom), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const room = await db.room.create({ data: input })

  return room
})
