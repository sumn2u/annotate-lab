import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TagsSidebarBox from './index';

// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: key => ({
        "image_tags": "Image Tags",
        "image_tags_classification_placeholder": "Image Classification",
      }[key]),
    }),
  }));

describe('TagsSidebarBox', () => {
  const mockImageClsList = ['Class A', 'Class B'];
  const mockImageTagList = ['Tag 1', 'Tag 2'];

  const renderComponent = (props) =>
    render(
      <TagsSidebarBox
        currentImage={{ cls: 'Class A', tags: ['Tag 1'] }}
        imageClsList={mockImageClsList}
        tags={mockImageTagList}
        imageTagList={mockImageTagList}
        onChangeImage={jest.fn()}
        {...props}
      />
    );

  it('renders correctly with image classification and tags', () => {
    renderComponent();
    // Check if title is rendered
    expect(screen.getByText('Image Tags')).toBeInTheDocument();

    // Check if Select components for classification and tags are rendered
    expect(screen.getByText('Tag 1')).toBeInTheDocument(); // Initial selected tag
  });
});
