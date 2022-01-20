import React from "react"

export const JsonDump: React.FC = ({ children }) => {
  return <pre>{JSON.stringify(children, null, 2)}</pre>
}
