import React from "react"
import { render } from "@testing-library/react"
import "@testing-library/jest-dom"
import Crosshairs from "./index"

describe("Crosshairs", () => {
  it("renders correctly with given x and y coordinates", () => {
    const { container } = render(<Crosshairs x={100} y={200} />)

    const verticalLine = container.firstChild
    const horizontalLine = container.lastChild

    expect(verticalLine).toHaveStyle("left: 100px")
    expect(verticalLine).toHaveStyle("top: 0px")
    expect(horizontalLine).toHaveStyle("top: 200px")
    expect(horizontalLine).toHaveStyle("left: 0px")
  })

  it("renders correctly with mousePosition prop", () => {
    const mousePosition = { current: { x: 150, y: 250 } }
    const { container } = render(<Crosshairs mousePosition={mousePosition} />)

    const verticalLine = container.firstChild
    const horizontalLine = container.lastChild

    expect(verticalLine).toHaveStyle("left: 150px")
    expect(verticalLine).toHaveStyle("top: 0px")
    expect(horizontalLine).toHaveStyle("top: 250px")
    expect(horizontalLine).toHaveStyle("left: 0px")
  })

  it("cleans up interval on unmount", () => {
    const mousePosition = { current: { x: 150, y: 250 } }
    const { unmount } = render(<Crosshairs mousePosition={mousePosition} />)

    jest.useFakeTimers()
    const setIntervalSpy = jest.spyOn(global, "setInterval")
    const clearIntervalSpy = jest.spyOn(global, "clearInterval")

    unmount()
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })
})
