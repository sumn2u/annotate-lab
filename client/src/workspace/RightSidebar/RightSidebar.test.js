import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import RightSidebar from './index'
import { createTheme, ThemeProvider } from '@mui/material/styles'

const theme = createTheme()

describe('RightSidebar', () => {
  beforeEach(() => {
    // Reset localStorage
    window.localStorage.clear()
  })

  test('renders with initially expanded state from localStorage', () => {
    window.localStorage.__REACT_WORKSPACE_LAYOUT_EXPANDED = JSON.stringify(true)

    render(
      <ThemeProvider theme={theme}>
        <RightSidebar>Test Content</RightSidebar>
      </ThemeProvider>
    )
    
    const container = screen.getByText('Test Content').closest('div')
    expect(container.parentElement).toHaveClass('expanded')
  })

  test('renders with initially collapsed state if localStorage is not set and window width is less than 1000', () => {
    window.innerWidth = 800
    render(
      <ThemeProvider theme={theme}>
        <RightSidebar>Test Content</RightSidebar>
      </ThemeProvider>
    )

    const container = screen.getByText('Test Content').closest('div')
    expect(container).not.toHaveClass('expanded')
  })

  test('updates localStorage on toggle', () => {
    render(
      <ThemeProvider theme={theme}>
        <RightSidebar>Test Content</RightSidebar>
      </ThemeProvider>
    )
    

    const expander = screen.getByRole('button')

    // Click to expand
    fireEvent.click(expander)
    expect(JSON.parse(window.localStorage.__REACT_WORKSPACE_LAYOUT_EXPANDED)).toBe(true)

    // Click to collapse
    fireEvent.click(expander)
    expect(JSON.parse(window.localStorage.__REACT_WORKSPACE_LAYOUT_EXPANDED)).toBe(false)
  })
})
