import React, { useEffect, useState } from "react"
import { styled } from "@mui/material/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import Box from "@mui/material/Box"
import * as muiColors from "@mui/material/colors"
import SidebarBoxContainer from "../SidebarBoxContainer"
import ImageIcon from '@mui/icons-material/Image';
import capitalize from "lodash/capitalize"
import classnames from "classnames"
import Checkbox from "@mui/material/Checkbox"
import getActiveImage from "../Annotator/reducers/get-active-image"

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

  const [change, setChange] = useState('')

  const handleClickLabel = (label) => {
    // console.log(state)
    onClick(getActiveImage(state))
    // console.log(getActiveImage(state).activeImage)
    saveActiveImage(getActiveImage(state).activeImage)
    // onSelectJump(label)
    // setChange(label)
  }

  return (
    <ThemeProvider theme={theme}>
      <SidebarBoxContainer
        title="Files List"
        subTitle=""
        icon={<ImageIcon style={{ color: muiColors.grey[700] }} />}
        noScroll={true}
        expandedByDefault
      >
        {allImages.map((image, index) => (
          <LabelContainer
            className={classnames({ selected: image.name === selectedImage })}
            onClick={() => {handleClickLabel(image.name)}}
            key = {index}
          >

          <Checkbox
            sx={{
              padding: 0, 
              '& .MuiSvgIcon-root': {
                fontSize: 14, // Set size
                color: image.processed ? 'green' : '', // Set color conditionally
              },
            }}
          />
            <span style={index === selectedImage? {backgroundColor: "rgba(255, 124, 120, 0.5)"} : {}}>
              <Label className={classnames({ selected: image.name === selectedImage })} style={ { backgroundColor: "withe" }}>
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