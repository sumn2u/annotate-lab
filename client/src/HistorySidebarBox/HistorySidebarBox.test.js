import React from "react"
import { render, fireEvent, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { HistorySidebarBox } from "./index"


// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: key => ({
        "menu.history": "History",
        "no.history": "No History Yet",
      }[key]),
    }),
  }));

describe("HistorySidebarBox", () => {
  const history = [
    { name: "History 1", time: new Date("2022-06-15T12:00:00Z") },
    { name: "History 2", time: new Date("2022-06-16T12:00:00Z") },
  ]

  it("renders empty text when there is no history", () => {
    const { getByText } = render(<HistorySidebarBox history={[]} />)
    expect(getByText("No History Yet")).toBeInTheDocument()
  })

  it("renders each history item correctly", () => {
    const mockHistory = [
        { name: "History 1", time: new Date("2021-08-01T12:00:00Z") },
        { name: "History 2", time: new Date("2021-08-01T12:00:00Z") },
      ];

    render(
      <HistorySidebarBox
        history={mockHistory}
        onRestoreHistory={() => {}}
      />
    );

    // Check if each history item name is rendered
    mockHistory.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });

    // Check if each history item time is rendered using a more direct query
    mockHistory.forEach((item) => {
        const formattedTime = item.time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        
        // Find all p elements and check if their textContent matches the formatted time
        const timeElements = screen.getAllByRole('listitem').map(listItem => listItem.querySelector('p'));
        const hasFormattedTime = timeElements.some(p => p.textContent === formattedTime);
        expect(hasFormattedTime).toBe(true);
      });

    // Check if the undo icon is rendered
    expect(screen.getByTestId("undo-icon")).toBeInTheDocument();
  });
  
  it("calls onRestoreHistory when undo icon is clicked for the first history item", () => {
    const onRestoreHistoryMock = jest.fn()
    const { getByTestId } = render(
      <HistorySidebarBox history={history} onRestoreHistory={onRestoreHistoryMock} />
    )
    fireEvent.click(getByTestId("undo-icon"))
    expect(onRestoreHistoryMock).toHaveBeenCalledTimes(2)
  })
})
