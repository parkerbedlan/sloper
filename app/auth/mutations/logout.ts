import deleteUser from "app/rooms/mutations/deleteUser"
import { Ctx } from "blitz"
import db from "db"

export default async function logout(_: any, ctx: Ctx) {
  if (ctx.session.userId) await db.user.deleteMany({ where: { id: ctx.session.userId } })
  return await ctx.session.$revoke()
}
