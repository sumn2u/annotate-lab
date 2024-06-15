import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import PointDistances from './index'

const mockProjectRegionBox = jest.fn(region => ({
  ...region,
  w: 10,
  h: 10,
}))

describe('PointDistances component', () => {
  it('renders correctly and displays distances', () => {
    const regions = [
      { id: 1, type: 'point', x: 0.1, y: 0.2 },
      { id: 2, type: 'point', x: 0.4, y: 0.6 },
    ]
    const pointDistancePrecision = 2
    const realSize = { w: 100, h: 100, unitName: 'cm' }

    const { container, getByText } = render(
      <PointDistances
        projectRegionBox={mockProjectRegionBox}
        regions={regions}
        pointDistancePrecision={pointDistancePrecision}
        realSize={realSize}
      />
    )

    // Check if path element is rendered
    expect(container.querySelector('path')).toBeInTheDocument()

    // Check if text element is rendered with correct distance
    const expectedDistance = Math.sqrt(
      Math.pow(regions[0].x * realSize.w - regions[1].x * realSize.w, 2) +
      Math.pow(regions[0].y * realSize.h - regions[1].y * realSize.h, 2)
    ).toFixed(pointDistancePrecision) + realSize.unitName

    expect(getByText(expectedDistance)).toBeInTheDocument()
  })
})
