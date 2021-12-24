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

  const user = await db.user.create({
    data: { roomId, name, role: room.isFull ? "SPECTATOR" : role },
    select: { id: true, name: true, role: true },
  })

  await ctx.session.$create({ userId: user.id, role: user.role as Role })
  return user
})
