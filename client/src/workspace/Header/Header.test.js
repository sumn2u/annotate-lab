import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "./index";
import '@testing-library/jest-dom';

jest.mock('../../../config.js', () => ({
    DEMO_SITE_URL: "https://annotate-docs.dwaste.live/",
    VITE_SERVER_URL: "http://localhost:5000",
  }));
  

// Mock the useTranslation hook with actual translations
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: key => ({
            "labname": "labname",
            "btn.download": "Download",
            "download.configuration": "Download Configuration",
            "download.image_mask": "Download Masked Image",
        }[key]),
    }),
}));

describe("Header", () => {
  const mockOnClickItem = jest.fn();

  const items = [
    { name: "Download", label: "Download", icon: <div>Mock Download Icon</div> },
    { name: "Item1", label: "Item 1", icon: <div>Mock Icon 1</div> },
    { name: "Item2", label: "Item 2", icon: <div>Mock Icon 2</div> }
  ];

  const mockClass = ['class1', 'class2', 'class3']


  beforeEach(() => {
    render(
      <Header
        items={items}
        onClickItem={mockOnClickItem}
        selectedImageName="image1"
        classList={mockClass}
      />
    );
  });

  it("renders all buttons with correct labels and icons", () => {
    // Verify Download button
    expect(screen.getByRole("button", { name: "Download" })).toBeInTheDocument();

    // Verify each HeaderButton in items is rendered with correct props
    items.filter((item) => item.name !== "Download").forEach((item) => {
      // Adjust the label to match the actual rendered text content
      const expectedButtonText = `Mock Icon ${item.name === "Item1" ? 1 : 2} ${item.label}`;
      
      // Print out the roles and names for debugging
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        console.log(`Role: ${button.getAttribute("role")}, Name: ${button.textContent}`);
      });

      expect(screen.getByRole("button", { name: expectedButtonText })).toBeInTheDocument();
      expect(screen.getByText(item.label)).toBeInTheDocument();
      expect(screen.getByText(`Mock Icon ${item.name === "Item1" ? 1 : 2}`)).toBeInTheDocument(); // Adjust as per your mock icon content
    });
  });

  it("handles click events correctly", () => {
    const button = screen.getByRole("button", { name: "Mock Icon 1 Item 1" });
    fireEvent.click(button);
    expect(mockOnClickItem).toHaveBeenCalledWith(items[1]);
  });

  
  it("renders download button as disabled if specified", () => {
    render(
      <Header
        items={[{ ...items[0], disabled: true }, ...items.slice(1)]}
        onClickItem={mockOnClickItem}
        selectedImageName="image1"
        classList={mockClass}
      />
    );

    const downloadButtons = screen.getAllByRole("button", { name: "Download" });
    const disabledButton = downloadButtons.find(button => button.hasAttribute('disabled'));

    expect(disabledButton).toBeInTheDocument();
    expect(disabledButton).toBeDisabled();
  });
});
