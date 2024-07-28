// @flow

import React from "react"
import Button from "@mui/material/Button"
import { createTheme, styled, ThemeProvider } from "@mui/material/styles"
import { useIconDictionary } from "../icon-dictionary.js"
import { iconMapping } from "../icon-mapping.js"
import { colors } from "@mui/material"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from '../../ThemeContext'
const defaultTheme = createTheme()
const defaultNameIconMapping = iconMapping

const getIcon = (name, customIconMapping) => {
  const Icon =
    customIconMapping[name.toLowerCase()] ||
    defaultNameIconMapping[name.toLowerCase()] ||
    defaultNameIconMapping.help
  return <Icon />
}

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  width: useMediaQuery(theme.breakpoints.down("sm")) ? 30 : 60,
  minWidth: useMediaQuery(theme.breakpoints.down("sm")) ? 32 : 64,
  paddingTop: 8,
  paddingBottom: 4,
  marginLeft: 1,
  marginRight: 1,
}))
const ButtonInnerContent = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}))
const IconContainer = styled("div")(({defaultTheme, theme, textHidden, disabled }) => ({
  color: disabled && theme === "light"
  ? defaultTheme.palette.action.disabled
  : theme === "dark" && !disabled
  ? colors.grey[200]
  :  colors.grey[700],
  height: textHidden ? 32 : 20,
  paddingTop: textHidden ? 8 : 0,
  "& .MuiSvgIcon-root": {
    width: 18,
    height: 18,
  },
}))
const Text = styled("div")(({ defaultTheme, theme, disabled }) => ({
  fontWeight: "bold",
  fontSize: 11,
  color: disabled && theme === "light"
  ? defaultTheme.palette.action.disabled
  : theme === "dark" && !disabled
  ? colors.grey[300]
  :  colors.grey[700],
  display: "flex",
  alignItems: "center",
  lineHeight: 1,
  justifyContent: "center",
}))

export const HeaderButton = ({
  name,
  label,
  icon,
  disabled,
  onClick,
  hideText = false,
}) => {
  const customIconMapping = useIconDictionary()
  const isSmallDevice = useMediaQuery(defaultTheme.breakpoints.down("sm"))
  const { theme } = useTheme();
  console.log(defaultTheme, theme, 'defaultTheme')
  return (
    <ThemeProvider theme={defaultTheme}>
      <StyledButton onClick={onClick} disabled={disabled}>
        <ButtonInnerContent>
          <IconContainer  defaultTheme={defaultTheme} theme={theme} textHidden={hideText} disabled={disabled}>
            {icon || getIcon(name, customIconMapping)}
          </IconContainer>
          {!hideText && !isSmallDevice && (
            <Text defaultTheme={defaultTheme} theme={theme} disabled={disabled}>
              <div>{label}</div>
            </Text>
          )}
        </ButtonInnerContent>
      </StyledButton>
    </ThemeProvider>
  )
}

export default HeaderButton
