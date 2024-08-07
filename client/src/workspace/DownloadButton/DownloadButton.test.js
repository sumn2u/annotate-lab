import React from "react"
import { render, fireEvent, waitFor } from "@testing-library/react"
import DownloadButton from "./index"
import "@testing-library/jest-dom"

// Mock the SnackbarContext
jest.mock("../../SnackbarContext/index.jsx", () => ({
  useSnackbar: () => ({
    showSnackbar: jest.fn(),
  }),
}))

// Mock the useTheme hook
jest.mock('../../ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light', // Provide mock theme
    toggleTheme: jest.fn(), // Mock function
  }),
}));

jest.mock("../../config.js", () => ({
  DOCS_URL: "https://annotate-docs.dwaste.live/",
  SERVER_URL: "http://localhost:5000",
}))

// Mock the useTranslation hook with actual translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) =>
      ({
        "btn.download": "Download",
        "download.configuration": "Download Configuration",
        "download.image_mask": "Download Masked Image",
      })[key],
  }),
}))

describe("DownloadButton", () => {
  it("should handle download when clicked on menu items", async () => {
    const mockHandleDownload = jest.fn()
    const selectedImageName = "example.png"
    const classList = ["class1", "class2", "class3"] // Example class list
    const selectedImages = [{ src: "example.png" }]
    const getImageFileSpy = jest.spyOn(
      require("../../utils/get-data-from-server.js"),
      "getImageFile",
    )

    const { getByText } = render(
      <DownloadButton
        selectedImageName={selectedImageName}
        classList={classList}
        hideHeaderText={false}
        disabled={false}
        selectedImages={selectedImages}
        handleDownload={mockHandleDownload}
      />,
    )

    fireEvent.click(getByText("Download")) // Open the menu

    await waitFor(() => {
      expect(getByText("Download Configuration")).toBeInTheDocument() // Ensure menu is still open
    })

    // Click on the menu item for configuration download
    fireEvent.click(getByText("Download Configuration"))
    await waitFor(() => {
      expect(getImageFileSpy).toBeCalledTimes(1)
    })
  })
})
