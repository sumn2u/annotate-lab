import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HighlightBox from './index';

describe('HighlightBox', () => {
  const mockRegion = {
    id: '1',
    type: 'box',
    highlighted: true,
    unfinished: false,
  };

  const mockPbox = {
    x: 50,
    y: 50,
    w: 100,
    h: 100,
  };

  const mockMouseEvents = {
    onMouseDown: jest.fn(),
    onMouseUp: jest.fn(),
    onMouseMove: jest.fn(),
  };

  const mockOnBeginMovePoint = jest.fn();
  const mockOnSelectRegion = jest.fn();

  it('renders correctly when region is highlighted', () => {
    const { container } = render(
      <HighlightBox
        mouseEvents={mockMouseEvents}
        dragWithPrimary={false}
        zoomWithPrimary={false}
        createWithPrimary={false}
        onBeginMovePoint={mockOnBeginMovePoint}
        onSelectRegion={mockOnSelectRegion}
        region={{ ...mockRegion, highlighted: true }}
        pbox={mockPbox}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('highlighted');
    expect(svg).toHaveStyle({ left: '45px', top: '45px', width: '110px', height: '110px' });
  });

  it('renders correctly when region is not highlighted', () => {
    const { container } = render(
      <HighlightBox
        mouseEvents={mockMouseEvents}
        dragWithPrimary={false}
        zoomWithPrimary={false}
        createWithPrimary={false}
        onBeginMovePoint={mockOnBeginMovePoint}
        onSelectRegion={mockOnSelectRegion}
        region={{ ...mockRegion, highlighted: false }}
        pbox={mockPbox}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).not.toHaveClass('highlighted');
    expect(svg).toHaveStyle({ left: '45px', top: '45px', width: '110px', height: '110px' });
    expect(svg).toHaveStyle('opacity: 0.6');
  });

  it('does not render when pbox has invalid dimensions', () => {
    const { container } = render(
      <HighlightBox
        mouseEvents={mockMouseEvents}
        dragWithPrimary={false}
        zoomWithPrimary={false}
        createWithPrimary={false}
        onBeginMovePoint={mockOnBeginMovePoint}
        onSelectRegion={mockOnSelectRegion}
        region={mockRegion}
        pbox={{ ...mockPbox, w: Infinity }}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('handles mouse down event correctly', () => {
    const { container } = render(
      <HighlightBox
        mouseEvents={mockMouseEvents}
        dragWithPrimary={false}
        zoomWithPrimary={false}
        createWithPrimary={false}
        onBeginMovePoint={mockOnBeginMovePoint}
        onSelectRegion={mockOnSelectRegion}
        region={mockRegion}
        pbox={mockPbox}
      />
    );

    const svg = container.querySelector('svg');
    fireEvent.mouseDown(svg, { button: 0 });

    expect(mockOnSelectRegion).toHaveBeenCalledWith(mockRegion);
  });

  it('does not render when region is unfinished', () => {
    const { container } = render(
      <HighlightBox
        mouseEvents={mockMouseEvents}
        dragWithPrimary={false}
        zoomWithPrimary={false}
        createWithPrimary={false}
        onBeginMovePoint={mockOnBeginMovePoint}
        onSelectRegion={mockOnSelectRegion}
        region={{ ...mockRegion, unfinished: true }}
        pbox={mockPbox}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
