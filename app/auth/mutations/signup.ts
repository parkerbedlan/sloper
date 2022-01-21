import { Signup } from "app/auth/validations"
import { resolver } from "blitz"
import db from "db"
import { Role } from "types"
import { playerCaps } from "fullstackUtils/internal"
import getCurrentUser from "app/users/queries/getCurrentUser"

export default resolver.pipe(resolver.zod(Signup), async ({ name, code, role }, ctx) => {
  const room = await db.room.findFirst({
    where: { code },
    select: {
      id: true,
      isFull: true,
      gameType: true,
      players: { select: { id: true, name: true } },
    },
  })

  if (!room) throw new Error("code: That room does not exist")

  // check if room is already full
  const currentUser = await getCurrentUser(undefined, ctx)
  let nonCurrentUsers: typeof room.players
  if (currentUser) nonCurrentUsers = room.players.filter((player) => player.id !== currentUser.id)
  else nonCurrentUsers = room.players
  if (nonCurrentUsers.length >= playerCaps[room?.gameType])
    throw new Error(`room is already full: ${currentUser} ${nonCurrentUsers}`)

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
  try {
    if (oldUserId) await db.user.delete({ where: { id: oldUserId } })
  } catch {
    // do nothing, because the error was most likely triggered by the old user already being deleted, which isn't a problem.
  }
  return user
})
