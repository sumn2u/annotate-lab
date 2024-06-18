import React, { useState } from "react"
import { styled } from "@mui/material/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import Box from "@mui/material/Box"
import * as muiColors from "@mui/material/colors"
import SidebarBoxContainer from "../SidebarBoxContainer"
import CollectionsIcon from '@mui/icons-material/Collections';
import capitalize from "lodash/capitalize"
import classnames from "classnames"
import Checkbox from "@mui/material/Checkbox"
import getActiveImage from "../Annotator/reducers/get-active-image"
import { useTranslation } from "react-i18next"

const theme = createTheme()
const LabelContainer = styled("div")(({ theme }) => ({
  display: "flex",
  paddingTop: 4,
  paddingBottom: 4,
  paddingLeft: 16,
  paddingRight: 16,
  alignItems: "center",
  cursor: "pointer",
  opacity: 0.7,
  backgroundColor: "#fff",
  "&:hover": {
    opacity: 1,
  },
  "&.selected": {
    opacity: 1,
    fontWeight: "bold",
  },
}))
const Circle = styled("div")(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: 12,
  marginRight: 8,
}))
const Label = styled("div")(({ theme }) => ({
  fontSize: 11,
  marginLeft: 2
}))
const DashSep = styled("div")(({ theme }) => ({
  flexGrow: 1,
  borderBottom: `2px dotted ${muiColors.grey[300]}`,
  marginLeft: 8,
  marginRight: 8,
}))
const Number = styled("div")(({ theme }) => ({
  fontSize: 11,
  textAlign: "center",
  minWidth: 14,
  paddingTop: 2,
  paddingBottom: 2,
  fontWeight: "bold",
  color: muiColors.grey[700],
}))

export const FilesListMenu = ({
  state,
  selectedImage,
  allImages,
  onSelectJump,
  saveActiveImage,
  onClick
}) => {
  const { t } = useTranslation();
  const [checkedImages, setCheckedImages] = useState({});

  const handleClickLabel = (label) => {
    onClick(getActiveImage(state))
    onSelectJump(label)
  }

  const handleCheckBoxClick = (index) => {
    if (!checkedImages[index]) {
      setCheckedImages(prevState => ({ ...prevState, [index]: true }))
    }
    saveActiveImage(getActiveImage(state).activeImage)
  }

  return (
    <ThemeProvider theme={theme}>
      <SidebarBoxContainer
        title={`${t("menu.images")} [${allImages.length > 0 ? allImages.length : 0}]`}
        subTitle=""
        icon={<CollectionsIcon style={{ color: muiColors.grey[700] }} />}
        noScroll={true}
        expandedByDefault
      >
        {allImages.map((image, index) => (
          <LabelContainer
            className={classnames({ selected: image.name === selectedImage })}
            key = {index}
          >

          <Checkbox
            sx={{
              padding: 0, 
              '& .MuiSvgIcon-root': {
                fontSize: 14, // Set size
                color: image.processed ? 'green' : '', // Set color conditionally
              },
              cursor: selectedImage !== null && selectedImage !== index ? 'not-allowed' : 'pointer',
            }}
            checked={!!checkedImages[index]}
            onClick={() => handleCheckBoxClick(index)}
            data-testid="checkbox"
            disabled={selectedImage !== null && selectedImage !== index}
          />
            <span style={index === selectedImage? {backgroundColor: "rgba(255, 124, 120, 0.5)"} : {}}>
              <Label className={classnames({ selected: image.name === selectedImage })} style={ { backgroundColor: "withe" }} onClick={() => {handleClickLabel(image.name)}}>
                {capitalize(image.name)}
              </Label>
            </span>
          </LabelContainer>
        ))}

        <Box pb={2} />
      </SidebarBoxContainer>
    </ThemeProvider>
  )
}

export default FilesListMenu