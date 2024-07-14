import React from "react"
import { render } from "@testing-library/react"
import "@testing-library/jest-dom"
import DebugSidebarBox from "./index"

describe("DebugSidebarBox", () => {
  const mockState = {
    images: [
      {
        regions: [{ highlighted: false }, { highlighted: true }],
      },
    ],
    selectedImage: 0,
    mode: "test-mode",
    selectedImageFrameTime: 100,
  }

  const mockLastAction = { type: "TEST_ACTION" }

  it("renders correctly with given props", () => {
    const { getByText } = render(
      <DebugSidebarBox state={mockState} lastAction={mockLastAction} />,
    )

    expect(getByText("region")).toBeInTheDocument()
    expect(getByText("lastAction")).toBeInTheDocument()
    expect(getByText("mode")).toBeInTheDocument()
    expect(getByText("frame:")).toBeInTheDocument()

    expect(getByText(/"highlighted": true/)).toBeInTheDocument()
    expect(getByText(/"type": "TEST_ACTION"/)).toBeInTheDocument()
    expect(getByText(/"test-mode"/)).toBeInTheDocument()
    expect(getByText(/100/)).toBeInTheDocument()
  })

  it("renders no region when no image is selected", () => {
    const modifiedState = { ...mockState, selectedImage: 1 }
    const { getByText } = render(
      <DebugSidebarBox state={modifiedState} lastAction={mockLastAction} />,
    )

    expect(getByText("region")).toBeInTheDocument()
    expect(getByText("lastAction")).toBeInTheDocument()
    expect(getByText("mode")).toBeInTheDocument()
    expect(getByText("frame:")).toBeInTheDocument()

    expect(getByText("null")).toBeInTheDocument() // No highlighted region
    expect(getByText(/"type": "TEST_ACTION"/)).toBeInTheDocument()
    expect(getByText(/"test-mode"/)).toBeInTheDocument()
    expect(getByText(/100/)).toBeInTheDocument()
  })
})
