import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import NoteSection from "./index"
import { Info } from "@mui/icons-material"

// Mock the useTranslation hook
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

describe("NoteSection", () => {
  test("renders correctly with given props", () => {
    const text = "More information can be found in our documentation"
    const link = "https://example.com/documentation"

    render(<NoteSection icon={Info} text={text} link={link} />)

    // Check if the icon is rendered
    expect(screen.getByTestId("NoteSection-icon")).toBeInTheDocument()

    // Check if the text is rendered
    expect(screen.getByText(text)).toBeInTheDocument()

    // Check if the link is rendered
    expect(screen.getByRole("link", { name: /here/i })).toHaveAttribute(
      "href",
      link,
    )
  })
})
