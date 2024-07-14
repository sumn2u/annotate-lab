import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import RegionLabel from "./index"
import { ThemeProvider } from "@mui/material/styles"
import { createTheme } from "@mui/material/styles"

const theme = createTheme()

const renderComponent = (props) => {
  return render(
    <ThemeProvider theme={theme}>
      <RegionLabel {...props} />
    </ThemeProvider>,
  )
}

// Mock the useTranslation hook
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) =>
      ({
        comment_placeholder: "Write comment here...",
        image_tags: "Image Tags",
        "region.no.name": "Enter a Name",
      })[key],
  }),
}))

describe("RegionLabel Component", () => {
  const defaultProps = {
    region: {
      cls: "Region A",
      tags: ["Tag1", "Tag2"],
      name: "Sample Region",
      highlighted: false,
      color: "#ff0000",
      type: "Type A",
    },
    editing: false,
    allowedClasses: ["Class1", "Class2"],
    allowedTags: ["Tag1", "Tag2", "Tag3"],
    onDelete: jest.fn(),
    onChange: jest.fn(),
    onClose: jest.fn(),
    onOpen: jest.fn(),
    onRegionClassAdded: jest.fn(),
    enabledProperties: ["class", "tags", "comment", "name"],
  }

  test("renders non-editing state correctly", () => {
    renderComponent(defaultProps)

    expect(screen.getByText("Region A")).toBeInTheDocument()
    expect(screen.getByText("Tag1")).toBeInTheDocument()
    expect(screen.getByText("Tag2")).toBeInTheDocument()
    expect(screen.getByText("Sample Region")).toBeInTheDocument()
  })

  test("renders editing state correctly", () => {
    renderComponent({ ...defaultProps, editing: true })
    expect(screen.getByText("Type A")).toBeInTheDocument()
    expect(screen.getByLabelText(/classification/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/comment/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/region name/i)).toBeInTheDocument()
  })

  test("handles click events", () => {
    renderComponent(defaultProps)
    fireEvent.click(screen.getByText("Region A"))
    expect(defaultProps.onOpen).toHaveBeenCalledWith(defaultProps.region)
  })

  test("handles comment input change", () => {
    renderComponent({ ...defaultProps, editing: true })
    expect(screen.getByLabelText(/comment/i)).toBeInTheDocument()
    const commentInput = screen.getByPlaceholderText(/Write comment here.../)
    fireEvent.change(commentInput, {
      target: { value: "New comment" },
    })
    expect(defaultProps.onChange).toHaveBeenCalledWith({
      ...defaultProps.region,
      comment: "New comment",
    })
  })

  test("handles delete button click", () => {
    renderComponent({ ...defaultProps, editing: true })
    fireEvent.click(screen.getByRole("button", { name: /delete/i }))
    expect(defaultProps.onDelete).toHaveBeenCalledWith(defaultProps.region)
  })

  test("handles class selection", () => {
    renderComponent({ ...defaultProps, editing: true })
    expect(screen.getByLabelText(/classification/i)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/classification/i), {
      target: { value: "Class1" },
    })
    expect(defaultProps.onChange).toHaveBeenCalled()
  })

  test("handles name input change", () => {
    renderComponent({ ...defaultProps, editing: true })
    const regionInput = screen.getByPlaceholderText(/Enter a Name/)
    fireEvent.change(regionInput, {
      target: { value: "New Name" },
    })
    expect(defaultProps.onChange).toHaveBeenCalled()
  })

  test("handles close button click", () => {
    renderComponent({ ...defaultProps, editing: true })
    expect(
      screen.getByRole("button", { name: "region-label-close" }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "region-label-close" }))
    expect(defaultProps.onClose).toHaveBeenCalledWith(defaultProps.region)
  })
})
