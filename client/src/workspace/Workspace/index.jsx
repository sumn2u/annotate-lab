import React from "react"
import {createTheme, styled, ThemeProvider} from "@mui/material/styles"
import Header from "../Header"
import RightSidebar from "../RightSidebar"
import WorkContainer from "../WorkContainer"
import {IconDictionaryContext} from "../icon-dictionary.js"
import {useMeasure} from "react-use"
import IconSidebar from "../IconSidebar"

const emptyAr = []
const emptyObj = {}
const theme = createTheme()

const Container = styled("div")(({theme}) => ({
  display: "flex",
  width: "100%",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
  maxWidth: "100vw",
}))
const SidebarsAndContent = styled("div")(({theme}) => ({
  display: "flex",
  flexGrow: 1,
  width: "100%",
  height: "100%",
  overflow: "hidden",
  maxWidth: "100vw",
}))

export default ({
  style = emptyObj,
  iconSidebarItems = emptyAr,
  headerItems = emptyAr,
  selectedTools = ["select"],
  rightSidebarItems = emptyAr,
  onClickHeaderItem,
  onClickIconSidebarItem,
  headerLeftSide = null,
  iconDictionary = emptyObj,
  rightSidebarExpanded,
  hideHeader = false,
  hideHeaderText = false,
  children,
  selectedImages = emptyAr,
  selectedImageName,
  classList
}) => {
  const [sidebarAndContentRef, sidebarAndContent] = useMeasure()
  return (
    <ThemeProvider theme={theme}>
      <IconDictionaryContext.Provider value={iconDictionary}>
        <Container style={style} data-testid="container">
          {!hideHeader && (
            <Header
              hideHeaderText={hideHeaderText}
              leftSideContent={headerLeftSide}
              onClickItem={onClickHeaderItem}
              items={headerItems}
              selectedImageName={selectedImageName}
              classList={classList}
              selectedImages={selectedImages}
            />
          )}
          <SidebarsAndContent ref={sidebarAndContentRef}>
          {iconSidebarItems.length === 0 ? null : (
              <IconSidebar
                onClickItem={onClickIconSidebarItem}
                selectedTools={selectedTools}
                items={iconSidebarItems}
              />
            )}
            <WorkContainer>{children}</WorkContainer>
            {rightSidebarItems.length === 0 ? null : (
              <RightSidebar
                initiallyExpanded={rightSidebarExpanded}
                height={sidebarAndContent.height || 0}
              >
                {rightSidebarItems}
              </RightSidebar>
            )}
          </SidebarsAndContent>
        </Container>
      </IconDictionaryContext.Provider>
    </ThemeProvider>
  )
}
