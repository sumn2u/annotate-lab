import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Workplace from './index' // Replace with the actual file name
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { IconDictionaryContext } from '../icon-dictionary.js'

const theme = createTheme()

jest.mock('react-use', () => ({
  useMeasure: () => [jest.fn(), { height: 500 }],
}))

jest.mock('../../config.js', () => ({
    DEMO_SITE_URL: "https://annotate-docs.dwaste.live/",
    VITE_SERVER_URL: "http://localhost:5000",
  }));
  
// Mock the useTranslation hook with actual translations
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: key => ({
            "labname": "labname",
            "btn.download": "Download",
            "download.configuration": "Download Configuration",
            "download.image_mask": "Download Masked Image",
        }[key]),
    }),
}));


describe('Workplace', () => {
  const mockIconDictionary = {}
  const renderComponent = (props = {}) =>
    render(
      <ThemeProvider theme={theme}>
        <IconDictionaryContext.Provider value={mockIconDictionary}>
          <Workplace {...props} />
        </IconDictionaryContext.Provider>
      </ThemeProvider>
    )

  test('renders without crashing', () => {
    renderComponent()
    expect(screen.getByTestId('container')).toBeInTheDocument()
  })

  test('renders header when hideHeader is false', () => {
    renderComponent({ hideHeader: false, headerItems: [{name: "Docs", label: "Docs"},] })
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  test('does not render header when hideHeader is true', () => {
    renderComponent({ hideHeader: true })
    expect(screen.queryByTestId('header')).not.toBeInTheDocument()
  })

  test('does not render icon sidebar when iconSidebarItems are empty', () => {
    renderComponent({ iconSidebarItems: [] })
    expect(screen.queryByTestId('icon-sidebar')).not.toBeInTheDocument()
  })

  test('renders right sidebar when rightSidebarItems are provided', () => {
    renderComponent({ rightSidebarItems: ['item1', 'item2'] })
    expect(screen.getByTestId('right-sidebar')).toBeInTheDocument()
  })

  test('does not render right sidebar when rightSidebarItems are empty', () => {
    renderComponent({ rightSidebarItems: [] })
    expect(screen.queryByTestId('right-sidebar')).not.toBeInTheDocument()
  })

  test('passes correct height to RightSidebar', () => {
    renderComponent({ rightSidebarItems: ['item1'], rightSidebarExpanded: true })
    expect(screen.getByTestId('right-sidebar')).toHaveStyle({ height: '500px' })
  })

})
