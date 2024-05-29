import React from "react"
import HeaderButton from "../HeaderButton"
import Box from "@mui/material/Box"
import { createTheme, styled, ThemeProvider } from "@mui/material/styles"
const theme = createTheme()
const emptyObj = {}

const Container = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  backgroundColor: "#fff",
  borderBottom: "1px solid #ccc",
  alignItems: "center",
  flexShrink: 1,
  boxSizing: "border-box",
}))

const BrandText = styled(Box)(({ theme }) => ({
  fontSize: "1.5rem",
  marginLeft: "1rem",
  display: "flex",
  alignItems: "center",
  "& .dot": {
    color: "green", // Color of the dot
  },
}))

export const Header = ({
  leftSideContent = null,
  hideHeaderText = false,
  items,
  onClickItem,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <Container>
      <BrandText flexGrow={1}>
          {"A"}
          <span className="dot">.</span>
          {"Lab"}
        </BrandText>
        <Box flexGrow={1}>{leftSideContent}</Box>
        {items.map((item) => (
          <HeaderButton
            key={item.name}
            hideText={hideHeaderText}
            onClick={() => onClickItem(item)}
            {...item}
          />
        ))}
      </Container>
    </ThemeProvider>
  )
}

export default Header
