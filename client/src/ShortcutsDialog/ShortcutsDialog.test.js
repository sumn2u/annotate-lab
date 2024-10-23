import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import ShortcutsDialog from "./index" // Adjust the import based on your file structure
import { useTranslation } from "react-i18next"

// Mock the useTranslation hook
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key, // Simply return the key as the translation
  }),
}))

describe("ShortcutsDialog", () => {
  const mockHandleClose = jest.fn()

  const defaultProps = {
    open: true,
    handleClose: mockHandleClose,
  }

  beforeEach(() => {
    render(<ShortcutsDialog {...defaultProps} />)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test("renders all shortcuts with corresponding actions", () => {
    const shortcuts = [
      { key: "Ctrl + Shift + B", action: "helptext_boundingbox" },
      { key: "Ctrl + Shift + Z", action: "helptext_zoom" },
      { key: "Ctrl + Shift + P", action: "helptext_polypolygon" },
      { key: "Ctrl + Shift + C", action: "helptext_circle" },
      { key: "↑", action: "short_key_up" },
      { key: "↓", action: "short_key_down" },
    ]
    shortcuts.forEach((shortcut, index) => {
      expect(screen.getByTestId(`shortcut-key-${index}`)).toBeInTheDocument()
    })
  })

  test("calls handleClose when close button is clicked", () => {
    const closeButton = screen.getByTestId("close-button")
    fireEvent.click(closeButton)
    expect(mockHandleClose).toHaveBeenCalledTimes(1)
  })


})
