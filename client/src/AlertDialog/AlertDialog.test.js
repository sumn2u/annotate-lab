import React from "react"
import { render, fireEvent, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import AlertDialog from "./index"

describe("AlertDialog Component", () => {
  const handleClose = jest.fn()
  const handleExit = jest.fn()
  const title = "Are you sure you want to exit?"
  const description =
    "Do you really want to exit? This action will clear the storage and all data will be lost."
  const exitConfirm = "Agree"
  const exitCancel = "Cancel"

  beforeEach(() => {
    render(
      <AlertDialog
        open={true}
        handleClose={handleClose}
        handleExit={handleExit}
        title={title}
        description={description}
        exitConfirm={exitConfirm}
        exitCancel={exitCancel}
      />,
    )
  })

  test("renders the alert dialog with correct title and description", () => {
    expect(screen.getByTestId("alert-dialog")).toBeInTheDocument()
    expect(screen.getByTestId("alert-dialog-title")).toHaveTextContent(title)
    expect(screen.getByTestId("alert-dialog-description")).toHaveTextContent(
      description,
    )
  })

  test("calls handleClose when cancel button is clicked", () => {
    fireEvent.click(screen.getByTestId("disagree-button"))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  test("calls handleExit when agree button is clicked", () => {
    fireEvent.click(screen.getByTestId("agree-button"))
    expect(handleExit).toHaveBeenCalledTimes(1)
  })
})
