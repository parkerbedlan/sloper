import { code } from "app/auth/validations"
import {
  AuthenticatedMiddlewareCtx,
  AuthenticatedSessionContext,
  AuthorizationError,
  resolver,
} from "blitz"
import db from "db"
import { Role } from "types"
import { z } from "zod"

const DeleteUser = z.object({
  id: z.number(),
  roomId: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteUser),
  resolver.authorize(),
  async ({ id, roomId }, ctx) => {
    if (ctx.session.role !== "HOST")
      throw new AuthorizationError("You must be host to remove someone from a room  ")
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const user = await db.user.deleteMany({ where: { id, roomId } })

    return user
  }
)
