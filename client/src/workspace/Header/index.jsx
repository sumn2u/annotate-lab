import React from "react"
import HeaderButton from "../HeaderButton"
import Box from "@mui/material/Box"
import { createTheme, styled, ThemeProvider } from "@mui/material/styles"
import DownloadButton from "../DownloadButton"
import { useTranslation } from "react-i18next"
const theme = createTheme()

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
}))

export const Header = ({
  leftSideContent = null,
  hideHeaderText = false,
  items,
  onClickItem,
  selectedImageName,
  classList
}) => {

  const{ t } = useTranslation()
  const downloadMenu = items.find((item) => item.name === "Download")
  
  return (
    <ThemeProvider theme={theme}>
      <Container>
      <BrandText flexGrow={1}>
          {t("labname")}
        </BrandText>
        <Box flexGrow={1}>{leftSideContent}</Box>
        {downloadMenu && <DownloadButton selectedImageName={selectedImageName} classList={classList} hideHeaderText={hideHeaderText} 
                onDownload={onClickItem} disabled={downloadMenu.disabled}
                />
          }
        {items.filter(item => item.name !== "Download").map((item) => (
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
