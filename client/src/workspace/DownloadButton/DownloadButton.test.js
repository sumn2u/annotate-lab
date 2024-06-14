import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import DownloadButton from './index';
import '@testing-library/jest-dom';

// Mock the SnackbarContext
jest.mock('../../SnackbarContext/index.jsx', () => ({
  useSnackbar: () => ({
    showSnackbar: jest.fn(),
  }),
}));

jest.mock('../../config.js', () => ({
    DEMO_SITE_URL: "https://annotate-docs.dwaste.live/",
    VITE_SERVER_URL: "http://localhost:5000",
  }));
  

// Mock the useTranslation hook with actual translations
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: key => ({
            "btn.download": "Download",
            "download.configuration": "Download Configuration",
            "download.image_mask": "Download Masked Image",
        }[key]),
    }),
}));

describe('DownloadButton', () => {
  it('should handle download when clicked on menu items', async () => {
    const mockHandleDownload = jest.fn();
    const selectedImageName = 'example.png';
    const classList = ['class1', 'class2', 'class3']; // Example class list

    const getImageFileSpy = jest.spyOn(require('../../utils/get-data-from-server.js'), 'getImageFile');

    const { getByText } = render(
      <DownloadButton
        selectedImageName={selectedImageName}
        classList={classList}
        hideHeaderText={false}
        disabled={false}
        handleDownload={mockHandleDownload}
      />
    );

    fireEvent.click(getByText('Download')); // Open the menu
    
    await waitFor(() => {
      expect(getByText('Download Configuration')).toBeInTheDocument(); // Ensure menu is still open
    });

    // Click on the menu item for configuration download
    fireEvent.click(getByText('Download Configuration'));
    await waitFor(() => {
      expect(getImageFileSpy).toBeCalledTimes(1)
    });

  });

});


