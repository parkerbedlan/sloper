import { Signup } from "app/auth/validations"
import { resolver } from "blitz"
import db from "db"
import { Role } from "types"

export default resolver.pipe(resolver.zod(Signup), async ({ name, code, role }, ctx) => {
  const room = await db.room.findFirst({
    where: { code },
    select: { id: true, isFull: true, players: { select: { id: true, name: true } } },
  })

  if (!room) throw new Error("code: That room does not exist")

  if (room.players.some((player) => player.name === name))
    throw new Error("name: That name is already taken.")

  const roomId = room.id

  let realRole: Role
  if (room.isFull) realRole = "SPECTATOR"
  else if (room.players.length === 0) realRole = "HOST"
  else realRole = role

  const user = await db.user.create({
    data: { roomId, name, role: realRole },
    select: { id: true, name: true, role: true },
  })

  const oldUserId = ctx.session.userId
  await ctx.session.$create({ userId: user.id, role: user.role as Role })
  if (oldUserId) await db.user.delete({ where: { id: oldUserId } })
  return user
})
