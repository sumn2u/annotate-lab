// @flow

import type {
  Action,
  MainLayoutImageAnnotationState,
} from "../../MainLayout/types";
import Immutable from "seamless-immutable";
import getActiveImage from "./get-active-image";

export default (state: MainLayoutImageAnnotationState, action: Action) => {
  const { currentImageIndex } = getActiveImage(state);

  switch (action.type) {
    case "IMAGE_OR_VIDEO_LOADED": {
      if (!currentImageIndex) return state;
      return Immutable(state).setIn(
        ["images", currentImageIndex.toString(), "pixelSize"],
        {
          w: action.metadata.naturalWidth,
          h: action.metadata.naturalHeight,
        }
      );
    }
  }
  return state;
};
