// @flow

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faCrosshairs,
  faDrawPolygon,
  faEdit,
  faExpand,
  faGripLines,
  faHandPaper,
  faHandPointer,
  faMask,
  faMousePointer,
  faSearch,
  faTag,
  faVectorSquare,
} from "@fortawesome/free-solid-svg-icons";
import { ReactElement } from "react";

const faStyle = { marginTop: 4, width: 16, height: 16, marginBottom: 4 };

export const iconDictionary: Record<string, () => ReactElement> = {
  select: () => (
    <FontAwesomeIcon
      style={faStyle}
      size="xs"
      fixedWidth
      icon={faMousePointer}
    />
  ),
  pan: () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={faHandPaper} />
  ),
  zoom: () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={faSearch} />
  ),
  "show-tags": () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={faTag} />
  ),
  "create-point": () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={faCrosshairs} />
  ),
  "create-box": () => (
    <FontAwesomeIcon
      style={faStyle}
      size="xs"
      fixedWidth
      icon={faVectorSquare}
    />
  ),
  "create-polygon": () => (
    <FontAwesomeIcon
      style={faStyle}
      size="xs"
      fixedWidth
      icon={faDrawPolygon}
    />
  ),
  "create-expanding-line": () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={faGripLines} />
  ),
  "create-line": () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={faChartLine} />
  ),
  "show-mask": () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={faMask} />
  ),
  "modify-allowed-area": () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={faEdit} />
  ),
  "create-keypoints": () => (
    <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={faExpand} />
  ),
  "full-screen": () => (
    <FontAwesomeIcon
      style={faStyle}
      size="xs"
      fixedWidth
      icon={faHandPointer}
    />
  ),
};

export default iconDictionary;
