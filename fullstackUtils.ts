import { User, Room as PrismaRoom } from "@prisma/client"

export type Message = { roomCode: string; text: string; authorName: string }

export class Room {
  status: "lobby" | "game" = "lobby"
  // prismaRoom: PrismaRoom
  players: User[] = []
  messages: Message[] = []

  addPlayer(newPlayer: User) {
    console.log("players before", this.players)
    console.log("adding player", newPlayer)
    this.players.push(newPlayer)
    console.log("players after", this.players)
  }

  removePlayer(userId: number) {
    this.players = this.players.filter((p) => p.id !== userId)
  }

  addMessage(newMessage: Message) {
    console.log("messages before", this.messages)
    console.log("adding this message", newMessage)
    this.messages.push(newMessage)
    console.log("messages after", this.messages)
  }

  handlers = {
    "new-message": this.addMessage,
    "new-player": this.addPlayer,
    "kicked-player": this.removePlayer,
  }
}
