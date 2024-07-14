import React from "react"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import '@testing-library/jest-dom'
import { ThemeProvider, createTheme } from "@mui/material/styles"
import ClassDistributionSidebarBox from "./index"
import { getLabels } from "../utils/get-data-from-server"

// Mocking the getLabels function
jest.mock("../utils/get-data-from-server", () => ({
  getLabels: jest.fn(),
}))

// Mocking the useTranslation hook
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
      t: (key) =>
        ({
          "menu.class_distribution": "Labels",
          "menu.class_distribution_count": "Count",
        })[key],
    }),
  }))

const generateTestId = () => `mock-bar-chart-${Math.random().toString(36).substr(2, 9)}`

// Mocking the BarChart component
jest.mock("@mui/x-charts/BarChart", () => ({
  BarChart: ({ xAxis, yAxis, series, id=generateTestId() }) => (
    <div data-testid={id} >
      {xAxis[0].data.map((label) => (
        <div key={label}>{label}</div>
      ))}
      {yAxis[0].label}
      {series.map((item, index) => (
        <div key={index}>{item.class}</div>
      ))}
    </div>
  ),
}))

const theme = createTheme()

const mockRegionClsList = ["Class1", "Class2"]

describe("ClassDistributionSidebarBox", () => {
  test("renders without crashing", async () => {
    await act(async () => {
      getLabels.mockResolvedValue([
        { class: "Class1", data: [10] },
        { class: "Class2", data: [5] },
      ])

      render(
        <ThemeProvider theme={theme}>
          <ClassDistributionSidebarBox regionClsList={mockRegionClsList} shouldExpand={true} />
        </ThemeProvider>
      )
    })

    expect(screen.getByText("Labels")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'refresh' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText("Class1")).toBeInTheDocument()
      expect(screen.getByText("Class2")).toBeInTheDocument()
    })
  })

  test("handles fetch error gracefully", async () => {
    await act(async () => {
      getLabels.mockRejectedValue(new Error("Failed to fetch"))

      render(
        <ThemeProvider theme={theme}>
          <ClassDistributionSidebarBox regionClsList={mockRegionClsList} shouldExpand={true} />
        </ThemeProvider>
      )

      expect(screen.queryByText("Labels")).not.toBeInTheDocument();
    })
  })
})
