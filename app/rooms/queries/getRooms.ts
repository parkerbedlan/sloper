import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetRoomsInput
  extends Pick<Prisma.RoomFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetRoomsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: rooms,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.room.count({ where }),
      query: (paginateArgs) => db.room.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      rooms,
      nextPage,
      hasMore,
      count,
    }
  }
)
