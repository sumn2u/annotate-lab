// @flow

import React from "react"
import {createTheme, ThemeProvider} from "@mui/material/styles"

const theme = createTheme({
  typography: {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  },
  overrides: {
    MuiButton: {
      root: {
        textTransform: "none",
      },
    },
  },
})

export const Theme = ({children}) => {
  return (
    <ThemeProvider theme={theme}>
      {/* <div className={classes.container}>{children}</div> */}
      <div style={{height: "100%"}}>{children}</div>
    </ThemeProvider>
  )
}

export default Theme
