import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { RegionSelectorSidebarBox } from "./index"

// Mock the useTranslation hook
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

describe("RegionSelectorSidebarBox", () => {
  const mockRegions = [
    {
      id: "1",
      color: "#ff0000",
      locked: true,
      visible: true,
      minimized: false,
      name: "Region 1",
      highlighted: false,
      points: [],
    },
    {
      id: "2",
      color: "#00ff00",
      locked: true,
      visible: true,
      minimized: true,
      name: "Region 2",
      highlighted: true,
      points: [],
    },
  ]

  const mockOnDeleteRegion = jest.fn()
  const mockOnChangeRegion = jest.fn()
  const mockOnSelectRegion = jest.fn()

  beforeEach(() => {
    render(
      <RegionSelectorSidebarBox
        regions={mockRegions}
        onDeleteRegion={mockOnDeleteRegion}
        onChangeRegion={mockOnChangeRegion}
        onSelectRegion={mockOnSelectRegion}
      />,
    )
  })

  it("renders region names correctly", () => {
    mockRegions.forEach((region) => {
      expect(screen.getByText(region.name)).toBeInTheDocument()
    })
  })

  it("renders region order correctly", () => {
    mockRegions.forEach((region, index) => {
      expect(screen.getByText(`#${index + 1}`)).toBeInTheDocument()
    })
  })

  it("renders region visibility icons correctly", () => {
    mockRegions.forEach((region) => {
      const visibilityIcon = region.visible
        ? screen.getByTestId(`VisibleIcon-${region.id}`)
        : screen.getByTestId(`InvisibleIcon-${region.id}`)
      expect(visibilityIcon).toBeInTheDocument()
    })
  })

  it("renders region lock icons correctly", () => {
    mockRegions.forEach((region) => {
      const lockIconTestId = region.locked ? "LockIcon" : "UnlockIcon"
      const lockIcon = screen.getByTestId(`${lockIconTestId}-${region.id}`)
      expect(lockIcon).toBeInTheDocument()
    })
  })

  it("renders region minimize icons correctly", () => {
    mockRegions.forEach((region) => {
      const minimizeIcon = region.minimized
        ? screen.getByTestId(`OpenInFullIcon-${region.id}`)
        : screen.getByTestId(`CloseFullscreenIcon-${region.id}`)
      expect(minimizeIcon).toBeInTheDocument()
    })
  })

  it("calls onSelectRegion when a region is clicked", () => {
    mockRegions.forEach((region) => {
      fireEvent.click(screen.getByText(region.name))
      expect(mockOnSelectRegion).toHaveBeenCalledWith(region)
    })
  })

  it("calls onDeleteRegion when the trash icon is clicked", () => {
    mockRegions.forEach((region) => {
      fireEvent.click(screen.getByTestId(`DeleteIcon-${region.id}`))
      expect(mockOnDeleteRegion).toHaveBeenCalledWith(region)
    })
  })

  it("calls onChangeRegion when the visibility icon in the header is clicked", () => {
    const visibleIconHeader = screen.getByTestId("VisibleIcon-header")

    fireEvent.click(visibleIconHeader)

    expect(mockOnChangeRegion).toHaveBeenCalledTimes(mockRegions.length)

    mockRegions.forEach((region) => {
      expect(mockOnChangeRegion).toHaveBeenCalledWith({
        ...region,
        visible: !region.visible,
      })
    })
  })

  it("calls onChangeRegion when the lock icon in the header is clicked", () => {
    const lockIconHeader = screen.getByTestId("LockIcon-header")
    fireEvent.click(lockIconHeader)

    expect(mockOnChangeRegion).toHaveBeenCalledTimes(4)
    mockRegions.forEach((region) => {
      expect(mockOnChangeRegion).toHaveBeenCalledWith({
        ...region,
        locked: !region.locked,
      })
    })
  })

  it("calls onDeleteRegion when the delete icon in the header is clicked", () => {
    const deleteIconHeader = screen.getByTestId("DeleteIcon-header")
    fireEvent.click(deleteIconHeader)
    expect(mockOnDeleteRegion).toHaveBeenCalledTimes(4)
  })
})
