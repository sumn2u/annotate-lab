// @flow

import type { Action, Image, MainLayoutState } from "../MainLayout/types";
import { useEffect, useReducer } from "react";
import Immutable from "seamless-immutable";

import type { KeypointsDefinition } from "../ImageCanvas/region-tools";
import MainLayout from "../MainLayout";
import SettingsProvider from "../SettingsProvider";
import combineReducers from "./reducers/combine-reducers";
import generalReducer from "./reducers/general-reducer";
import getFromLocalStorage from "../utils/get-from-local-storage";
import historyHandler from "./reducers/history-handler";
import imageReducer from "./reducers/image-reducer";
import useEventCallback from "use-event-callback";
import videoReducer from "./reducers/video-reducer";
import { AutosegOptions } from "autoseg/webworker";

export type AnnotatorProps = {
  taskDescription?: string;
  allowedArea?: { x: number; y: number; w: number; h: number };
  regionTagList?: Array<string>;
  regionClsList?: Array<string>;
  imageTagList?: Array<string>;
  imageClsList?: Array<string>;
  enabledTools?: Array<string>;
  selectedTool?: String;
  showTags?: boolean;
  selectedImage?: string | number;
  images?: Array<Image>;
  showPointDistances?: boolean;
  pointDistancePrecision?: number;
  RegionEditLabel?: Node;
  onExit: (state: MainLayoutState) => any;
  videoTime?: number;
  videoSrc?: string;
  keyframes?: Object;
  videoName?: string;
  keypointDefinitions?: KeypointsDefinition;
  fullImageSegmentationMode?: boolean;
  autoSegmentationOptions?: AutosegOptions;
  hideHeader?: boolean;
  hideHeaderText?: boolean;
  hideNext?: boolean;
  hidePrev?: boolean;
  hideClone?: boolean;
  hideSettings?: boolean;
  hideFullScreen?: boolean;
  hideSave?: boolean;
  allowComments?: boolean;
  onNextImage?: (state: MainLayoutState) => void;
  onPrevImage?: (state: MainLayoutState) => void;
};

export const Annotator = ({
  images,
  allowedArea,
  selectedImage = images && images.length > 0 ? 0 : undefined,
  showPointDistances,
  pointDistancePrecision,
  showTags = getFromLocalStorage("showTags", true),
  enabledTools = [
    "select",
    "create-point",
    "create-box",
    "create-polygon",
    "create-line",
    "create-expanding-line",
    "show-mask",
  ],
  selectedTool = "select",
  regionTagList = [],
  regionClsList = [],
  imageTagList = [],
  imageClsList = [],
  keyframes = {},
  taskDescription = "",
  fullImageSegmentationMode = false,
  RegionEditLabel,
  videoSrc,
  videoTime = 0,
  videoName,
  onExit,
  onNextImage,
  onPrevImage,
  keypointDefinitions,
  autoSegmentationOptions = { type: "autoseg" },
  hideHeader,
  hideHeaderText,
  hideNext,
  hidePrev,
  hideClone,
  hideSettings,
  hideFullScreen,
  hideSave,
  allowComments,
}: AnnotatorProps) => {
  if (typeof selectedImage === "string") {
    selectedImage = (images || []).findIndex(
      (img) => img.src === selectedImage
    );
    if (selectedImage === -1) selectedImage = undefined;
  }
  const annotationType = images ? "image" : "video";
  const [state, dispatchToReducer] = useReducer(
    historyHandler(
      combineReducers(
        annotationType === "image" ? imageReducer : videoReducer,
        generalReducer
      )
    ),
    Immutable({
      annotationType,
      showTags,
      allowedArea,
      showPointDistances,
      pointDistancePrecision,
      selectedTool,
      fullImageSegmentationMode: fullImageSegmentationMode,
      autoSegmentationOptions,
      mode: null,
      taskDescription,
      showMask: true,
      labelImages: imageClsList.length > 0 || imageTagList.length > 0,
      regionClsList,
      regionTagList,
      imageClsList,
      imageTagList,
      currentVideoTime: videoTime,
      enabledTools,
      history: [],
      videoName,
      keypointDefinitions,
      allowComments,
      ...(annotationType === "image"
        ? {
            selectedImage,
            images,
            selectedImageFrameTime:
              images && images.length > 0 ? images[0].frameTime : undefined,
          }
        : {
            videoSrc,
            keyframes,
          }),
    })
  );

  const dispatch = useEventCallback((action: Action) => {
    if (action.type === "HEADER_BUTTON_CLICKED") {
      if (["Exit", "Done", "Save", "Complete"].includes(action.buttonName)) {
        return onExit(Immutable(state).without("history"));
      } else if (action.buttonName === "Next" && onNextImage) {
        return onNextImage(Immutable(state).without("history"));
      } else if (action.buttonName === "Prev" && onPrevImage) {
        return onPrevImage(Immutable(state).without("history"));
      }
    }
    dispatchToReducer(action);
  });

  const onRegionClassAdded = useEventCallback((cls) => {
    dispatchToReducer({
      type: "ON_CLS_ADDED",
      cls: cls,
    });
  });

  useEffect(() => {
    if (selectedImage === undefined) return;
    dispatchToReducer({
      type: "SELECT_IMAGE",
      imageIndex: +selectedImage,
      image: state.images[selectedImage],
    });
  }, [selectedImage, state.images]);

  if (!images && !videoSrc)
    return 'Missing required prop "images" or "videoSrc"';

  return (
    <SettingsProvider>
      <MainLayout
        RegionEditLabel={RegionEditLabel}
        alwaysShowNextButton={Boolean(onNextImage)}
        alwaysShowPrevButton={Boolean(onPrevImage)}
        state={state}
        dispatch={dispatch}
        onRegionClassAdded={onRegionClassAdded}
        hideHeader={hideHeader}
        hideHeaderText={hideHeaderText}
        hideNext={hideNext}
        hidePrev={hidePrev}
        hideClone={hideClone}
        hideSettings={hideSettings}
        hideFullScreen={hideFullScreen}
        hideSave={hideSave}
      />
    </SettingsProvider>
  );
};

export default Annotator;
