import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import HeaderButton from './index';
import DownloadIcon from '@mui/icons-material/Download';
import '@testing-library/jest-dom';

// Mock useIconDictionary hook
jest.mock('../icon-dictionary.js', () => ({
  useIconDictionary: () => ({}), // Mocking an empty object since iconMapping is directly used
}));

describe('HeaderButton', () => {
  it('renders button with icon and label', () => {
    const handleClick = jest.fn();
    render(
      <HeaderButton
        key={"download-button"}
        name={"Download"}
        label={"Download"}
        onClick={handleClick}
        icon={<DownloadIcon />}
      />
    );

    // Verify icon
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();

    // Verify label
    expect(screen.getByText('Download')).toBeInTheDocument();

    // Verify button is enabled
    expect(screen.getByRole('button')).not.toBeDisabled();

    // Click the button and verify onClick callback
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders button with custom icon', () => {
    const handleClick = jest.fn();
    render(
      <HeaderButton
        key={"custom-button"}
        name={"Custom"}
        label={"Custom"}
        onClick={handleClick}
        icon={<span data-testid="custom-icon">Custom Icon</span>}
      />
    );

    // Verify custom icon
    expect(screen.getByRole('button').querySelector('[data-testid="custom-icon"]')).toBeInTheDocument();
  });

  it('renders button as disabled', () => {
    const handleClick = jest.fn();
    render(
      <HeaderButton
        key={"disabled-button"}
        name={"Disabled"}
        label={"Disabled"}
        onClick={handleClick}
        disabled
        icon={<DownloadIcon />}
      />
    );

    // Verify button is disabled
    expect(screen.getByRole('button')).toBeDisabled();

    // Click should not invoke onClick callback
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
