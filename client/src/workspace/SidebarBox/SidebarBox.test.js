import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import SidebarBox from "./index"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import ExpandIcon from "@mui/icons-material/ExpandMore"

const theme = createTheme()

const mockIconDictionary = {
  "sample title": () => <div data-testid="custom-icon" />,
}

jest.mock("../icon-dictionary.js", () => ({
  useIconDictionary: () => mockIconDictionary,
}))

describe("SidebarBox", () => {
  beforeEach(() => {
    // Reset localStorage
    window.localStorage.clear()
  })

  test("renders with initially expanded state from localStorage", () => {
    window.localStorage.__REACT_WORKSPACE_SIDEBAR_EXPANDED_sample =
      JSON.stringify(true)

    render(
      <ThemeProvider theme={theme}>
        <SidebarBox title="sample" subTitle="sub" icon={<ExpandIcon />}>
          Test Content
        </SidebarBox>
      </ThemeProvider>,
    )

    const content = screen.getByText("Test Content")
    expect(content).toBeInTheDocument()
  })

  test("renders with initially collapsed state if localStorage is not set", () => {
    render(
      <ThemeProvider theme={theme}>
        <SidebarBox title="sample" subTitle="sub" icon={<ExpandIcon />}>
          Test Content
        </SidebarBox>
      </ThemeProvider>,
    )

    const content = screen.queryByText("Test Content")
    expect(content).not.toBeVisible()
  })

  test("updates localStorage on toggle", () => {
    render(
      <ThemeProvider theme={theme}>
        <SidebarBox title="sample" subTitle="sub" icon={<ExpandIcon />}>
          Test Content
        </SidebarBox>
      </ThemeProvider>,
    )

    const toggleButton = screen.getByRole("button")

    // Click to expand
    fireEvent.click(toggleButton)
    expect(
      JSON.parse(window.localStorage.__REACT_WORKSPACE_SIDEBAR_EXPANDED_sample),
    ).toBe(true)

    // Click to collapse
    fireEvent.click(toggleButton)
    expect(
      JSON.parse(window.localStorage.__REACT_WORKSPACE_SIDEBAR_EXPANDED_sample),
    ).toBe(false)
  })

  test("renders custom icon from icon dictionary", () => {
    render(
      <ThemeProvider theme={theme}>
        <SidebarBox title="Sample Title" subTitle="sub">
          Test Content
        </SidebarBox>
      </ThemeProvider>,
    )

    const customIcon = screen.getByTestId("custom-icon")
    expect(customIcon).toBeInTheDocument()
  })
})
