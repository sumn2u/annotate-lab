import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import KeyframesSelectorSidebarBox from "./index"
import getTimeString from "../KeyframeTimeline/get-time-string"

jest.mock("../KeyframeTimeline/get-time-string")
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}))

// Mock the useTheme hook
jest.mock('../ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light', // Provide mock theme
    toggleTheme: jest.fn(), // Mock function
  }),
}));

describe("KeyframesSelectorSidebarBox", () => {
  const mockOnChangeVideoTime = jest.fn()
  const mockOnDeleteKeyframe = jest.fn()

  const setup = (props = {}) => {
    const utils = render(
      <KeyframesSelectorSidebarBox
        currentVideoTime={0}
        keyframes={{ 100: { regions: [] }, 300: { regions: [{}, {}] } }}
        onChangeVideoTime={mockOnChangeVideoTime}
        onDeleteKeyframe={mockOnDeleteKeyframe}
        {...props}
      />,
    )
    return { ...utils }
  }

  beforeEach(() => {
    getTimeString.mockImplementation(
      (time) => `00:${String(time / 10).padStart(2, "0")}`,
    )
  })

  test("renders correctly", () => {
    setup()

    expect(screen.getByText(/00:10/)).toBeInTheDocument()
    expect(screen.getByText(/00:30/)).toBeInTheDocument()
  })

  test("handles click to change video time", () => {
    setup()

    const keyframeRow = screen
      .getByText((content, element) => {
        const hasText = (node) => node.textContent.includes("00:10")
        const nodeHasText = hasText(element)
        const childrenDontHaveText = Array.from(element.children).every(
          (child) => !hasText(child),
        )
        return nodeHasText && childrenDontHaveText
      })
      .closest("div")
    fireEvent.click(keyframeRow)

    expect(mockOnChangeVideoTime).toHaveBeenCalledWith(100)
  })

  test("handles click to delete keyframe", () => {
    setup()

    const deleteButton = screen.getAllByTestId("DeleteIcon")[0]
    fireEvent.click(deleteButton)

    expect(mockOnDeleteKeyframe).toHaveBeenCalledWith(100)
  })

  test("stops event propagation on delete", () => {
    setup()

    const keyframeRow = screen.getByText(/00:10/).closest(".keyframeRow")
    expect(keyframeRow).toBeInTheDocument()

    const deleteButton = keyframeRow.querySelector("[data-testid='DeleteIcon']")
    expect(deleteButton).toBeInTheDocument()

    const stopPropagationSpy = jest.spyOn(Event.prototype, "stopPropagation")
    fireEvent.click(deleteButton)

    expect(stopPropagationSpy).toHaveBeenCalled()

    expect(mockOnChangeVideoTime).toHaveBeenCalled()
    expect(mockOnDeleteKeyframe).toHaveBeenCalledWith(100)
  })
})
