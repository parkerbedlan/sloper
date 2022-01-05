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
  roomId: z.number().optional(),
  code: code.optional(),
})

export default resolver.pipe(
  resolver.zod(DeleteUser),
  resolver.authorize(),
  async ({ id, roomId, code }, ctx) => {
    // TODO: secure this by making sure the deleting user is a host of that room, rather than of any room at all using useCurrentUser
    if (ctx.session.role !== "HOST" && ctx.session.userId !== id)
      throw new AuthorizationError("To delete a user, you must be host or said user.")

    if (roomId) {
      const user = await db.user.deleteMany({ where: { id, roomId } })
      return user
    } else if (code) {
      const foundRoom = await db.room.findFirst({ where: { code }, select: { id: true } })
      if (!foundRoom) {
        throw new Error(`Room with code ${code} does not exist.`)
      }
      const foundRoomId = foundRoom.id
      const user = await db.user.deleteMany({ where: { id, roomId: foundRoomId } })
    } else {
      throw new Error("You must provide either a roomId or a code to delete a user")
    }
  }
)
