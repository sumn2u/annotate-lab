import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import SidebarBoxContainer from "./index"

// Mock the useTheme hook
jest.mock('../ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light', // Provide mock theme
    toggleTheme: jest.fn(), // Mock function
  }),
}));

describe("SidebarBoxContainer", () => {
  const icon = <span data-testid="test-icon" />
  const title = "Test Title"
  const childText = "Test Child Component"

  it("renders with title and children", () => {
    render(
      <SidebarBoxContainer icon={icon} title={title}>
        <div>{childText}</div>
      </SidebarBoxContainer>,
    )

    // Assert that the title is rendered
    expect(screen.getByText(title)).toBeInTheDocument()

    // Assert that the child component content is rendered
    expect(screen.getByText(childText)).toBeInTheDocument()

    // Assert that the icon is rendered
    expect(screen.getByTestId("test-icon")).toBeInTheDocument()
  })
})
