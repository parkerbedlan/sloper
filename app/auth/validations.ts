import { z } from "zod"

export const code = z
  .string()
  .length(4, "Room code should be 4 letters long")
  .regex(/[A-Z]/, "All characters must be uppercase letters")
  .transform((str) => str.toUpperCase().trim())

export const name = z
  .string()
  .min(1)
  .max(12)
  .transform((str) => str.toUpperCase().trim())

export const role = z.enum(["SPECTATOR", "PLAYER", "HOST"])

export const gameType = z.enum([
  "Rock Paper Scissors",
  "Tic Tac Toe",
  "Prisoner's Dilemma",
  "Chess",
])

export const Signup = z.object({
  code,
  name,
  role,
})
