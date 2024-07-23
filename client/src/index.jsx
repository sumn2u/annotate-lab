// @flow
import React from "react"
import { createRoot } from "react-dom/client"
import Theme from "./Theme"
import { ThemeProvider  } from "./ThemeContext"
import Annotation from "./Annotation"
import "./site.css"
import { SettingsProvider } from "./SettingsProvider"

const Site = () => {
  const path = window.location.pathname
    .replace(/\/$/, "")
    .split("/")
    .slice(-1)[0]
  return (
    <ThemeProvider>
      <Theme>
        <SettingsProvider>
          <Annotation />
        </SettingsProvider>
      </Theme>
    </ThemeProvider>
  )
}

const container = document.getElementById("app")
const root = createRoot(container)

root.render(<Site />)
