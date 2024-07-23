import React from "react"
import HeaderButton from "../HeaderButton"
import Box from "@mui/material/Box"
import { createTheme, styled, ThemeProvider } from "@mui/material/styles"
import DownloadButton from "../DownloadButton"
import { useTranslation } from "react-i18next"
import useMediaQuery from "@mui/material/useMediaQuery"

const theme = createTheme()

const Container = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  // backgroundColor: "#fff",
  borderBottom: "1px solid #ccc",
  alignItems: "center",
  flexShrink: 1,
  boxSizing: "border-box",
}))

const BrandText = styled(Box)(({ theme }) => ({
  fontSize: useMediaQuery(theme.breakpoints.down("sm")) ? "1rem" : "1.5rem",
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
  classList,
  selectedImages,
}) => {
  const { t } = useTranslation()
  const isSmallDevice = useMediaQuery(theme.breakpoints.down("sm"))
  const downloadMenu = items.find((item) => item.name === "Download")
  const isDownloadDisabled =
    (downloadMenu && downloadMenu.disabled) ||
    (selectedImages && selectedImages.length <= 0)
  return (
    <ThemeProvider theme={theme}>
      <Container data-testid="header">
        <BrandText flexGrow={1}>{t("labname")}</BrandText>
        {!isSmallDevice && <Box flexGrow={1}>{leftSideContent}</Box>}
        {downloadMenu && (
          <DownloadButton
            selectedImageName={selectedImageName}
            classList={classList}
            hideHeaderText={hideHeaderText}
            onDownload={onClickItem}
            disabled={isDownloadDisabled}
            selectedImages={selectedImages}
          />
        )}
        {items
          .filter((item) => item.name !== "Download")
          .map((item) => (
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
