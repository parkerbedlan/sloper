import { Dispatch, SetStateAction, useEffect, useState } from "react"
import create from "zustand"

export const createBasicStore = <Type>(initialValue: Type) => {
  type BasicStoreState = {
    value: Type
    set: Dispatch<SetStateAction<Type>>
  }
  const useBasicStore = create<BasicStoreState>((set, get) => ({
    value: initialValue,
    set: (value) => {
      let newValue: Type
      if (typeof value === "function") {
        const prevValue = get().value
        newValue = (value as (prevState: Type) => Type)(prevValue)
      } else {
        newValue = value
      }
      set((state) => ({ value: newValue }))
    },
  }))
  return useBasicStore
}

export const createBasicStorePersist = <Type>(
  initialValue: Type,
  name: string,
  isString = false
) => {
  type BasicStoreState = {
    value: Type
    initialize: () => void
    set: Dispatch<SetStateAction<Type>>
  }
  const useBasicStore = create<BasicStoreState>((set, get) => ({
    value: initialValue,
    initialize: () => {
      const cachedValue = window.localStorage.getItem(name)
      const newValue: Type = cachedValue
        ? isString
          ? cachedValue
          : JSON.parse(cachedValue)
        : initialValue
      set(() => ({
        value: newValue,
      }))
    },
    set: (value) => {
      let newValue: Type
      if (typeof value === "function") {
        const prevValue = get().value
        newValue = (value as (prevState: Type) => Type)(prevValue)
      } else {
        newValue = value
      }
      window.localStorage.setItem(name, "" + newValue)
      set((state) => ({ value: newValue }))
    },
  }))
  return useBasicStore
}

export const createGlobalStatePersist = <Type>(
  initialValue: Type,
  name: string,
  isString = false
) => {
  const useBasicStore = createBasicStorePersist<Type>(initialValue, name, isString)
  const useGlobalState: () => [Type, Dispatch<SetStateAction<Type>>] = () => {
    const initialize = useBasicStore((s) => s.initialize)
    useEffect(() => {
      initialize()
    }, [initialize])

    const value = useBasicStore((s) => s.value)
    const setValue = useBasicStore((s) => s.set)
    return [value, setValue]
  }
  return useGlobalState
}

export const createGlobalState = <Type>(initialValue: Type) => {
  const useBasicStore = createBasicStore<Type>(initialValue)
  const useGlobalState: () => [Type, Dispatch<SetStateAction<Type>>] = () => {
    const value = useBasicStore((s) => s.value)
    const setValue = useBasicStore((s) => s.set)
    return [value, setValue]
  }
  return useGlobalState
}

export const useStatePersist = <Type>(
  initialValue: Type,
  name: string,
  isString = false
): [Type, Dispatch<SetStateAction<Type>>] => {
  const [value, setValue] = useState<Type>(initialValue)
  useEffect(() => {
    const cachedValue = window.localStorage.getItem(name)
    console.log("cachedValue", cachedValue)
    const newValue: Type = cachedValue
      ? isString
        ? cachedValue
        : JSON.parse(cachedValue)
      : initialValue
    setValue(newValue)
  }, [name, initialValue, isString])
  useEffect(() => {
    window.localStorage.setItem(name, "" + value)
  }, [name, value])

  return [value, setValue]
}
