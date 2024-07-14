import React from "react"
import { render, fireEvent } from "@testing-library/react"
import SettingsProvider, { SettingsContext } from "./index"

// Mock localStorage for testing
let localStorageMock = {}

beforeEach(() => {
  localStorageMock = {}

  // Mock localStorage.getItem
  jest
    .spyOn(window.localStorage.__proto__, "getItem")
    .mockImplementation((key) => {
      return localStorageMock[key]
    })

  // Mock localStorage.setItem
  jest
    .spyOn(window.localStorage.__proto__, "setItem")
    .mockImplementation((key, value) => {
      localStorageMock[key] = value.toString()
    })

  // Mock localStorage.clear
  jest.spyOn(window.localStorage.__proto__, "clear").mockImplementation(() => {
    localStorageMock = {}
  })
})

afterEach(() => {
  jest.restoreAllMocks()
})

test("should provide default settings", () => {
  const { getByTestId } = render(
    <SettingsProvider>
      <TestComponent />
    </SettingsProvider>,
  )

  expect(getByTestId("showCrosshairs").textContent).toBe("")
  expect(getByTestId("showHighlightBox").textContent).toBe("")
})

test("should change setting and update state", () => {
  const { getByText, getByTestId } = render(
    <SettingsProvider>
      <TestComponent />
    </SettingsProvider>,
  )

  // Simulate changing setting
  fireEvent.click(getByText("Toggle Crosshairs"))

  // Assert state change in component
  expect(getByTestId("showCrosshairs").textContent).toBe("true")
})

// Test component to be rendered inside SettingsProvider for interacting with settings
const TestComponent = () => {
  const settings = React.useContext(SettingsContext)

  return (
    <div>
      <span data-testid="showCrosshairs">
        {settings && settings.showCrosshairs?.toString()}
      </span>
      <span data-testid="showHighlightBox">
        {settings && settings.showHighlightBox?.toString()}
      </span>
      <button
        onClick={() =>
          settings.changeSetting("showCrosshairs", !settings.showCrosshairs)
        }
      >
        Toggle Crosshairs
      </button>
    </div>
  )
}
