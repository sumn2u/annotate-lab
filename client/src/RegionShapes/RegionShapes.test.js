import React from 'react';
import { render } from '@testing-library/react';
import RegionShapes, { WrappedRegionList, getStrokeWidth } from './index';
import '@testing-library/jest-dom'

jest.mock('color-alpha', () => jest.fn((color, alpha) => `rgba(${color},${alpha})`));
jest.mock('../config', () => ({
  OUTLINE_THICKNESS_CONFIG: {
    POLYGON: 3,
    CIRCLE: 2,
    BOUNDING_BOX: 2,
  },
}));


const mockRegions = [
    { type: 'box', x: 0.1, y: 0.1, w: 0.5, h: 0.5, color: 'red', id: '1' },
    { type: 'circle', x: 0.2, y: 0.2, w: 0.3, h: 0.3, color: 'blue', id: '2' },
    { type: 'polygon', points: [[0.1, 0.1], [0.2, 0.2], [0.3, 0.1]], color: 'green', id: '3' },
  ];
  
  describe('RegionShapes Component', () => {
    it('renders without crashing', () => {
      const imagePosition = { topLeft: { x: 0, y: 0 }, bottomRight: { x: 100, y: 100 } };
      const { container } = render(
        <RegionShapes
          mat={null}
          imagePosition={imagePosition}
          regions={mockRegions}
          keypointDefinitions={{}}
          fullSegmentationMode={false}
        />
      );
      expect(container).toBeInTheDocument();
    });
  
    it('renders the correct number of region components', () => {
      const imagePosition = { topLeft: { x: 0, y: 0 }, bottomRight: { x: 100, y: 100 } };
      const { container } = render(
        <RegionShapes
          mat={null}
          imagePosition={imagePosition}
          regions={mockRegions}
          keypointDefinitions={{}}
          fullSegmentationMode={false}
        />
      );
      const boxes = container.querySelectorAll('rect');
      const circles = container.querySelectorAll('ellipse');
      const polygons = container.querySelectorAll('polygon');
      expect(boxes.length).toBe(1);
      expect(circles.length).toBe(1);
      expect(polygons.length).toBe(1);
    });
  });
  
  describe('WrappedRegionList Component', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <svg>
          <WrappedRegionList
            regions={mockRegions}
            iw={100}
            ih={100}
            keypointDefinitions={{}}
            fullSegmentationMode={false}
          />
        </svg>
      );
      expect(container).toBeInTheDocument();
    });
  
    it('applies the correct stroke width from config', () => {
      expect(getStrokeWidth({ type: 'box' })).toBe(2);
      expect(getStrokeWidth({ type: 'circle' })).toBe(2);
      expect(getStrokeWidth({ type: 'polygon' })).toBe(3);
      expect(getStrokeWidth({ type: 'line' })).toBe(2); // Default case
    });
  });