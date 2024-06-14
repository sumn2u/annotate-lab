import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClassSelectionMenu from './index';

// Mock regions data
const mockRegionClsList = ['class1', 'class2', 'class3'];
const mockRegionColorList = ['#ff0000', '#00ff00', '#0000ff'];
const mockRegions = undefined
const mockOnSelectCls = jest.fn();

// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: key => ({
            "menu.classifications": "Labels",
        }[key]),
    }),
}));


describe('ClassSelectionMenu', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <ClassSelectionMenu
        selectedCls={'class1'}
        regionClsList={mockRegionClsList}
        regionColorList={mockRegionColorList}
        onSelectCls={mockOnSelectCls}
        regions={mockRegions} 
        expandedByDefault={true}
      />
    );

    // Check if the component exists
    expect(getByText('Class1')).toBeInTheDocument();
    expect(getByText('Class2')).toBeInTheDocument();
    expect(getByText('Class3')).toBeInTheDocument();

  });

  it('calls onSelectCls with the correct class when a label is clicked', () => {
    const { getByText } = render(
      <ClassSelectionMenu
        selectedCls={'class1'}
        regionClsList={mockRegionClsList}
        regionColorList={mockRegionColorList}
        onSelectCls={mockOnSelectCls}
        regions={mockRegions}
      />
    );

    fireEvent.click(getByText('Class2'));

    expect(mockOnSelectCls).toHaveBeenCalledWith('class2');
  });

  it('selects the first class if no class is selected initially', () => {
    render(
      <ClassSelectionMenu
        selectedCls={null}
        regionClsList={mockRegionClsList}
        regionColorList={mockRegionColorList}
        onSelectCls={mockOnSelectCls}
        regions={mockRegions}
      />
    );
    expect(mockOnSelectCls).toHaveBeenCalledWith('class1');
  });
});
