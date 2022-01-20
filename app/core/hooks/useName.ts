import { createGlobalStatePersist } from "app/zustand/zustandTools"

export const useName = createGlobalStatePersist("", "name", true)
