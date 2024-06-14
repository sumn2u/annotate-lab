import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IconSidebar from './index';
import { useIconDictionary } from '../icon-dictionary';

jest.mock('../icon-dictionary.js', () => ({
  useIconDictionary: jest.fn(),
}));

const mockIconMapping = {
  'sampleicon': () => <div>Sample Icon</div>,
};

const mockItems = [
  {
    name: 'SampleIcon',
    helperText: 'Sample Helper Text',
    onClick: jest.fn(),
  },
  {
    name: 'AnotherIcon',
    selected: true,
  },
  {
    name: 'DisabledIcon',
    disabled: true,
  },
];

describe('IconSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useIconDictionary.mockReturnValue(mockIconMapping);
  });

  it('renders icons with tooltips correctly', async () => {
    render(<IconSidebar items={mockItems} />);

    // Check if icons are rendered
    expect(screen.getByText('Sample Icon')).toBeInTheDocument();
    
    // Simulate hovering over the button to display the tooltip
    const iconButton = screen.getByRole('button', { name: /Sample Helper Text/i });
    fireEvent.mouseOver(iconButton);
    
    // Check if tooltips are rendered correctly
    const tooltip = await screen.findByText('Sample Helper Text');
    expect(tooltip).toBeInTheDocument();
  });

  it('handles icon button clicks correctly', () => {
    render(<IconSidebar items={mockItems} />);

    // Click the icon with onClick handler
    const iconButton = screen.getByText('Sample Icon').closest('button');
    fireEvent.click(iconButton);

    // Verify the onClick handler is called
    expect(mockItems[0].onClick).toHaveBeenCalled();
  });

  it('disables the button when item is disabled', () => {
    render(<IconSidebar items={mockItems} />);

    // Check if the disabled button is rendered correctly
    const disabledButton = screen.getAllByRole('button')[2];
    expect(disabledButton).toBeDisabled();
  });

  it('applies primary color to selected items', () => {
    render(<IconSidebar items={mockItems} selectedTools={['anothericon']} />);

    // Check if the selected button has the primary color
    const selectedButton = screen.getAllByRole('button')[1];
    expect(selectedButton).toHaveClass('MuiIconButton-colorPrimary');
  });

  it('handles onClickItem correctly if item onClick is not provided', () => {
    const handleClickItem = jest.fn();
    render(<IconSidebar items={mockItems} onClickItem={handleClickItem} />);

    // Click the icon without onClick handler
    const iconButton = screen.getAllByRole('button')[1];
    fireEvent.click(iconButton);

    // Verify the onClickItem handler is called
    expect(handleClickItem).toHaveBeenCalledWith(mockItems[1]);
  });
});
