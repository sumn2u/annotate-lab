// @flow

import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import FullscreenIcon from "@mui/icons-material/Fullscreen"
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew"

const faStyle = { marginTop: 4, width: 16, height: 16, marginBottom: 4 }

export const iconDictionary = {
  select: () => (
    <FontAwesomeIcon
      style={faStyle}
      size="xs"
      fixedWidth
      icon={{iconName: "mouse-pointer", prefix: "fas"}}
    />
  ),
  pan: () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={{iconName: 'hand-paper', prefix: 'fas'}} />
  ),
  zoom: () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={{iconName: 'search', prefix: 'fas'}} />
  ),
  "show-tags": () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={{iconName: 'tag', prefix: 'fas'}} />
  ),
  "create-point": () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={{iconName: 'crosshairs', prefix: 'fas'}} />
  ),
  "create-box": () => (
    <FontAwesomeIcon
      style={faStyle}
      size="xs"
      fixedWidth
      icon={{iconName: 'vector-square', prefix: 'fas'}}
    />
  ),
  "create-polygon": () => (
    <FontAwesomeIcon
      style={faStyle}
      size="xs"
      fixedWidth
      icon={{iconName: 'draw-polygon', prefix: 'fas'}}
    />
  ),
  "create-expanding-line": () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={{iconName: 'grip-lines', prefix: 'fas'}} />
  ),
  "create-line": () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={{iconName: 'chart-line', prefix: 'fas'}} />
  ),
  "show-mask": () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={{iconName: 'mask', prefix: 'fas'}} />
  ),
  "modify-allowed-area": () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={{iconName: 'edit', prefix: 'fas'}} />
  ),
  "create-keypoints": AccessibilityNewIcon,
  window: FullscreenIcon,
}

export default iconDictionary
