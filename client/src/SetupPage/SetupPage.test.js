import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { SetupPage } from "./index"
import { useSettings } from "../SettingsProvider"

// Mock the useTheme hook
jest.mock('../ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light', // Provide mock theme
    toggleTheme: jest.fn(), // Mock function
  }),
}));

// Mock useTranslation hook
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}))

jest.mock("../config.js", () => ({
  DOCS_URL: "https://annotate-docs.dwaste.live/",
  SERVER_URL: "http://localhost:5000",
}))

// Mock useSettings hook
jest.mock("../SettingsProvider", () => ({
  useSettings: jest.fn(),
}))

// Mock dependent components
jest.mock("../ConfigureObjectDetection", () =>
  jest.fn(() => <div data-testid="ConfigureObjectDetection" />),
)
jest.mock("../ConfigureImageSegmentation", () =>
  jest.fn(() => <div data-testid="ConfigureImageSegmentation" />),
)
jest.mock("../ConfigurationTask", () =>
  jest.fn(({ onChange }) => (
    <input
      data-testid="ConfigurationTask"
      onChange={(e) => onChange({ target: { value: e.target.value } })}
    />
  )),
)
jest.mock("../ImageUpload", () =>
  jest.fn(() => <div data-testid="ImageUpload" />),
)

describe("SetupPage", () => {
  const mockSettings = {
    taskDescription: "",
    configuration: { labels: [] },
    images: [],
    taskChoice: "object_detection",
  }
  const mockSetConfiguration = jest.fn()
  const mockSetShowLabel = jest.fn()

  beforeEach(() => {
    useSettings.mockReturnValue({
      changeSetting: jest.fn(),
    })

    render(
      <SetupPage
        settings={mockSettings}
        setConfiguration={mockSetConfiguration}
        setShowLabel={mockSetShowLabel}
      />,
    )
  })

  test("renders tabs and default content", () => {
    // Check tabs
    expect(screen.getByText("setup.tabs.taskinfo")).toBeInTheDocument()
    expect(screen.getByText("setup.tabs.configure")).toBeInTheDocument()
    expect(screen.getByText("setup.tabs.images")).toBeInTheDocument()

    // Check default content (datatype tab)
    expect(screen.getByTestId("ConfigurationTask")).toBeInTheDocument()
  })
})
