import React from "react"
import { render } from "@testing-library/react"
import "@testing-library/jest-dom"
import RegionTags from "./index"

const mockProjectRegionBox = jest.fn((region) => ({
  x: region.x * 100,
  y: region.y * 100,
  w: region.w * 100,
  h: region.h * 100,
}))

const mouseEvents = {
  onMouseDown: jest.fn(),
  onMouseUp: jest.fn(),
  onMouseMove: jest.fn(),
}

const regionClsList = ["Class1", "Class2"]
const regionTagList = ["Tag1", "Tag2"]
const onBeginRegionEdit = jest.fn()
const onChangeRegion = jest.fn()
const onCloseRegionEdit = jest.fn()
const onDeleteRegion = jest.fn()
const onRegionClassAdded = jest.fn()
const enabledRegionProps = ["tags"]
const imageSrc = "test-image.jpg"
const layoutParams = { current: { iw: 800, ih: 600 } }

// Mock the useTranslation hook
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) =>
      ({
        "configuration.image_upload.description": "Upload images",
        "error.server_connection": "Server connection error",
      })[key],
  }),
}))

// Mock the useTheme hook
jest.mock('../ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light', // Provide mock theme
    toggleTheme: jest.fn(), // Mock function
  }),
}));

describe("RegionTags component", () => {
  it("renders correctly for different region conditions", () => {
    const regions = [
      {
        id: 1,
        type: "box",
        x: 0.1,
        y: 0.2,
        w: 0.3,
        h: 0.4,
        highlighted: true,
        visible: true,
        editingLabels: false,
      },
      {
        id: 2,
        type: "polygon",
        x: 0.2,
        y: 0.3,
        w: 0.3,
        h: 0.4,
        highlighted: true,
        visible: true,
        locked: true,
      },
      {
        id: 3,
        type: "line",
        x: 0.3,
        y: 0.4,
        w: 0.3,
        h: 0.4,
        highlighted: true,
        visible: false,
      },
      {
        id: 4,
        type: "keypoints",
        x: 0.4,
        y: 0.5,
        w: 0.3,
        h: 0.4,
        highlighted: true,
        visible: true,
        minimized: true,
      },
    ]

    const { container } = render(
      <RegionTags
        regions={regions}
        projectRegionBox={mockProjectRegionBox}
        mouseEvents={mouseEvents}
        regionClsList={regionClsList}
        regionTagList={regionTagList}
        onBeginRegionEdit={onBeginRegionEdit}
        onChangeRegion={onChangeRegion}
        onCloseRegionEdit={onCloseRegionEdit}
        onDeleteRegion={onDeleteRegion}
        layoutParams={layoutParams}
        imageSrc={imageSrc}
        RegionEditLabel={null}
        onRegionClassAdded={onRegionClassAdded}
        enabledRegionProps={enabledRegionProps}
      />,
    )

    // Check if the region elements are rendered
    expect(container.querySelectorAll("div").length).toBeGreaterThan(0)

    // Check if the locked region renders LockIcon
    expect(container.querySelector("svg")).toBeInTheDocument()

    // Check if the minimized region is not rendered
    expect(container.querySelectorAll(`[data-testid="region-4"]`).length).toBe(
      0,
    )

    // Check if the hidden region is not rendered
    expect(container.querySelectorAll(`[data-testid="region-3"]`).length).toBe(
      0,
    )

    // // Check if visible and non-minimized regions are rendered
    expect(container.querySelectorAll(`[data-testid="region-1"]`).length).toBe(
      1,
    )
    expect(container.querySelectorAll(`[data-testid="region-2"]`).length).toBe(
      1,
    )
  })
})
