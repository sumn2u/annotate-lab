import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import KeyframeTimeline from "./index"

jest.mock("./get-time-string", () =>
  jest.fn((time) => `00:${String(time / 1000).padStart(2, "0")}`),
)

describe("KeyframeTimeline", () => {
  const mockOnChangeCurrentTime = jest.fn()

  const setup = (props = {}) => {
    const utils = render(
      <KeyframeTimeline
        currentTime={0}
        duration={1000}
        onChangeCurrentTime={mockOnChangeCurrentTime}
        keyframes={{ 500: "keyframe1", 1000: "keyframe2" }}
        {...props}
      />,
    )
    return { ...utils }
  }

  test("renders correctly", () => {
    setup()
    expect(screen.getAllByText("00:00")[0]).toBeInTheDocument()
    expect(
      screen.getAllByText((content, element) => content.startsWith("00:0.25"))
        .length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText((content, element) => content.startsWith("00:0.75"))
        .length,
    ).toBeGreaterThan(0)
  })

  test("displays keyframe markers", () => {
    setup()
    const keyframeMarker1 = screen.getByText("00:0.25")
    const keyframeMarker2 = screen.getByText("00:0.75")

    expect(keyframeMarker1).toBeInTheDocument()
    expect(keyframeMarker2).toBeInTheDocument()
  })

  test("handles dragging the position cursor", () => {
    setup()
    const positionCursor = screen
      .getAllByText("00:00")
      .find((element) => element.style.cursor === "grab")

    // Simulate mouse down and mouse move events
    fireEvent.mouseDown(positionCursor, { clientX: 0 })
    fireEvent.mouseMove(positionCursor, { clientX: 300 }) // Assuming the container width would be 600, so this moves to halfway
    fireEvent.mouseUp(positionCursor, { clientX: 300 })

    // The instant current time should now be updated
    expect(mockOnChangeCurrentTime).toHaveBeenCalledWith(expect.any(Number))
  })
})
