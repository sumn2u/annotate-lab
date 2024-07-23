// @flow

import React from "react"
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles"
import { SnackbarProvider } from "../SnackbarContext"
import { useTheme } from "../ThemeContext"
import { grey } from "@mui/material/colors"

export const themes = {
  light: createTheme({
    typography: {
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    },
    palette: {
      mode: 'light',
      background: {
        default: '#fff',
        paper: '#f5f5f5',
      },
      text: {
        primary: '#000',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  }),
  dark: createTheme({
    typography: {
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    },
    palette: {
      mode: 'dark',
      background: {
        default: '#121212',
        paper: '#1d1d1d',
      },
      text: {
        primary: '#fff',
        secondary: grey[400],
      },
      default: {
        main: "#ffffff", // Default color for dark mode buttons
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  }),
};

export const Theme = ({ children }) => {
  const { theme } = useTheme(); // Get current theme from context
  return (
    <MuiThemeProvider theme={themes[theme]}>
      <SnackbarProvider>
        <div style={{ height: '100%' }}>{children}</div>
      </SnackbarProvider>
    </MuiThemeProvider>
  );
};

export default Theme;