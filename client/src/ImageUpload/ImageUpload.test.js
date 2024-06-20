import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import axios from 'axios'
import ImageUpload from './index'
import { useSnackbar } from '../SnackbarContext'

jest.mock('../config.js', () => ({
    DOCS_URL: "https://annotate-docs.dwaste.live/",
    SERVER_URL: "http://localhost:5000",
    UPLOAD_LIMIT: 5,
}));

jest.mock('axios')

const images = [
  {
    src: 'http://127.0.0.1:5000/uploads/clothes.jpeg',
    name: 'clothes',
    selectedClsList: '',
    comment: '',
    processed: false,
  },
  {
    src: 'http://127.0.0.1:5000/uploads/shoes.jpeg',
    name: 'shoes',
    selectedClsList: '',
    comment: '',
    processed: false,
  },
];

// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: key => ({
        "configuration.image_upload.description": "Upload images",
        "error.server_connection": "Server connection error",
      }[key]),
    }),
  }));
  

jest.mock('../SnackbarContext', () => ({
  useSnackbar: jest.fn(),
}))

const mockShowSnackbar = jest.fn()
useSnackbar.mockReturnValue({ showSnackbar: mockShowSnackbar })

const renderComponent = (props = {}) =>
  render(
    <ImageUpload  settingsImages={images} {...props} />
  )

describe('ImageUpload', () => {
  beforeEach(() => {
    console.error = jest.fn()
    jest.clearAllMocks()
  })

  test('renders the component', () => {
    renderComponent()
    expect(screen.getByText(/Upload images/i)).toBeInTheDocument()
  })

  test('displays an error message for rejected files', async () => {
    renderComponent()
    global.URL.createObjectURL = jest.fn();
    const file = new File(['dummy content'], 'example.txt', { type: 'text/plain' })
    const input = screen.getByTestId('file-input')

    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => expect(mockShowSnackbar).toHaveBeenCalledWith(expect.anything(), 'error'))
  })

  test('uploads files and shows progress', async () => {
    const mockResponse = {
      data: {
        message: 'Upload successful',
        files: [{ url: 'http://example.com/image.jpg', filename: 'image.jpg' }],
      },
    }

    axios.post.mockResolvedValueOnce(mockResponse)

    renderComponent({ onImageUpload: jest.fn() })
    global.URL.createObjectURL = jest.fn();

    const file = new File(['dummy content'], 'example.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input')

    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => expect(mockShowSnackbar).toHaveBeenCalledWith(expect.anything(), 'success'))
    // await waitFor(() => expect(screen.getByText('Upload successful')).toBeInTheDocument())
    const image = screen.getByRole('img');
    const expectedSrc = 'http://example.com/image.jpg';
  
    expect(image.getAttribute('src')).toBe(expectedSrc);
  })
  

  test('handles upload error', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: 'Upload failed' } } })

    renderComponent()
    global.URL.createObjectURL = jest.fn();

    const file = new File(['dummy content'], 'example.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input')

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(mockShowSnackbar).toHaveBeenCalledWith('Upload failed', 'error'))
  })

  test('deletes an image', async () => {
    const mockUploadResponse = {
      data: {
        message: 'Upload successful',
        files: [{ url: 'http://example.com/image.jpg', filename: 'image.jpg' }],
      },
    }
    const mockDeleteResponse = {
      data: {
        message: 'Delete successful',
      },
    }

    axios.post.mockResolvedValueOnce(mockUploadResponse)
    axios.delete.mockResolvedValueOnce(mockDeleteResponse)

    renderComponent({ onImageUpload: jest.fn() })
    global.URL.createObjectURL = jest.fn();

    const file = new File(['dummy content'], 'example.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input')

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(mockShowSnackbar).toHaveBeenCalledWith("Upload successful", 'success'))
    const image = screen.getByRole('img');
    const expectedSrc = 'http://example.com/image.jpg';
  
    expect(image.getAttribute('src')).toBe(expectedSrc);

    const deleteButton = screen.getByTestId("DeleteIcon")
    fireEvent.click(deleteButton)

    await waitFor(() => expect(mockShowSnackbar).toHaveBeenCalledWith('Delete successful', 'success'))
  })
})
