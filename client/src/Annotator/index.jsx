// @flow

import React, {useEffect, useReducer} from "react"
import makeImmutable, {without} from "seamless-immutable"

import MainLayout from "../MainLayout"
import combineReducers from "./reducers/combine-reducers.js"
import generalReducer from "./reducers/general-reducer.js"
import getFromLocalStorage from "../utils/get-from-local-storage"
import historyHandler from "./reducers/history-handler.js"
import imageReducer from "./reducers/image-reducer.js"
import useEventCallback from "use-event-callback"
import videoReducer from "./reducers/video-reducer.js"
import PropTypes from "prop-types"
import noopReducer from "./reducers/noop-reducer.js"
import {useTranslation} from "react-i18next"
import { saveActiveImage, saveData, splitRegionData, getImageData} from "../utils/send-data-to-server"
import { useSnackbar} from "../SnackbarContext/index.jsx"
export const Annotator = ({
  images,
  allowedArea,
  selectedImage = images && images.length > 0 ? 0 : undefined,
  showPointDistances,
  pointDistancePrecision,
  showTags = getFromLocalStorage("showTags", true),
  enabledTools = ["select",
  "create-point",
  "create-box",
  "create-circle",
  "create-polygon",
  "create-line",
  "create-expanding-line"],
  selectedTool = "select",
  regionTagList = [],
  regionClsList = [],
  regionColorList = [],
  preselectCls = null,
  imageTagList = [],
  imageClsList = [],
  keyframes = {},
  taskDescription = "",
  RegionEditLabel,
  videoSrc,
  videoTime = 0,
  videoName,
  onExit,
  settings,
  keypointDefinitions,
  onSelectJump,
  onShowSettings,
  openDocs,
  hideHeader,
  hideHeaderText,
  hideClone,
  hideSettings,
  hideSave,
  enabledRegionProps = ["class", "name"],
  allImages = [],
  userReducer
}) => {
  if (typeof selectedImage === "string") {
    selectedImage = (images || []).findIndex((img) => img.src === selectedImage)
    if (selectedImage === -1) selectedImage = undefined
  }
  const { showSnackbar } = useSnackbar();
  const {t} = useTranslation();
  const annotationType = images ? "image" : "video"
  const [state, dispatchToReducer] = useReducer(
    historyHandler(
      combineReducers(
        annotationType === "image" ? imageReducer : videoReducer,
        generalReducer,
        userReducer === undefined ? noopReducer : userReducer
      )
    ),
    makeImmutable({
      annotationType,
      showTags,
      allowedArea,
      showPointDistances,
      pointDistancePrecision,
      selectedTool,
      mode: null,
      taskDescription,
      settings,
      labelImages: imageClsList.length > 0 || imageTagList.length > 0,
      regionClsList,
      regionColorList,
      preselectCls,
      regionTagList,
      imageClsList,
      imageTagList,
      currentVideoTime: videoTime,
      enabledTools,
      history: [],
      videoName,
      keypointDefinitions,
      enabledRegionProps,
      ...(annotationType === "image"
        ? {
          selectedImage,
          images,
          selectedImageFrameTime:
            images && images.length > 0 ? images[0].frameTime : undefined
        }
        : {
          videoSrc,
          keyframes
        })
    })
  )
  const saveCurrentData = (activeImage) =>{
    saveActiveImage(activeImage).then(response => {
      showSnackbar(response.message, 'success');
    })
    .catch(error => {
      showSnackbar(error.message, 'error');
    });
  }
  const preprocessDataBeforeSend = async (output) => {
    const selectedImageIndex = output.selectedImage;
    let _image = output.images[selectedImageIndex];
    let regions = _image['regions'] || [];
    let imageData = getImageData(_image);
  
    imageData['regions'] = [];
    for (let regionNum = 0; regionNum < regions.length; regionNum++) {
      imageData['regions'].push(splitRegionData(regions[regionNum]));
    }
  
    try {
      const response = await saveData(imageData);
      showSnackbar(response.message, 'success');
      return imageData['regions'];
    } catch (error) {
      showSnackbar(error.message, 'error');
      return [];
    }
  };
  
  const dispatch = useEventCallback(async (action) => {
    if (action.type === "HEADER_BUTTON_CLICKED") {
      if (["Exit", "Done", "Save", "Complete"].includes(action.buttonName)) {
        // save the current data
        if (action.buttonName === "Save") {
          const result = await preprocessDataBeforeSend(without(state, "history"));
          dispatchToReducer({
            type: "SAVE_LAST_REGIONS",
            payload: result
          });
          dispatchToReducer({
            type: "ENABLE_DOWNLOAD",
            payload: result
          });
          return null;
        } else {
          return onExit(without(state, "history"));
        }
      } else if (action.buttonName === "Docs" ) {
        return openDocs();
      } else if (action.buttonName === "Settings") {
        return onShowSettings();
      }
    }
    dispatchToReducer(action);
  });

  const onRegionClassAdded = useEventCallback((cls) => {
    dispatchToReducer({
      type: "ON_CLS_ADDED",
      cls: cls
    })
  })


  useEffect(() => {
    if (selectedImage === undefined) return

    const { multipleRegionLabels, multipleRegions } = settings?.configuration || {};
    const hasSingleRegion = state.images?.[selectedImage]?.regions?.length === 1;
    const disableSelection = (hasSingleRegion && !multipleRegionLabels) ||  (hasSingleRegion && !multipleRegions);

    dispatchToReducer({
      type: "DISABLE_SELECT_TOOL",
      selectedTool: disableSelection ? [] : selectedTool
    })
   
    dispatchToReducer({
      type: "SELECT_IMAGE",
      imageIndex: selectedImage,
      image: state.images[selectedImage]
    })
  }, [selectedImage, state.images])
 
  if (!images && !videoSrc)
    return t("error.imagevideo")

  return (
        <MainLayout
          RegionEditLabel={RegionEditLabel}
          state={state}
          dispatch={dispatch}
          onRegionClassAdded={onRegionClassAdded}
          hideHeader={hideHeader}
          hideHeaderText={hideHeaderText}
          hideClone={hideClone}
          hideSettings={hideSettings}
          hideSave={hideSave}
          allImages= {allImages}
          enabledRegionProps={enabledRegionProps}
          onSelectJump={onSelectJump}
          saveActiveImage = {saveCurrentData}
        />
  )
}

Annotator.propTypes = {
  images: PropTypes.array,
  allowedArea: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    w: PropTypes.number.isRequired,
    h: PropTypes.number.isRequired
  }),
  selectedImage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  showPointDistances: PropTypes.bool,
  pointDistancePrecision: PropTypes.number,
  showTags: PropTypes.bool,
  enabledTools: PropTypes.arrayOf(PropTypes.string),
  selectedTool: PropTypes.string,
  regionTagList: PropTypes.arrayOf(PropTypes.string),
  regionClsList: PropTypes.arrayOf(PropTypes.string),
  regionColorList: PropTypes.arrayOf(PropTypes.string),
  preselectCls: PropTypes.string,
  imageTagList: PropTypes.arrayOf(PropTypes.string),
  imageClsList: PropTypes.arrayOf(PropTypes.string),
  keyframes: PropTypes.object,
  taskDescription: PropTypes.string,
  RegionEditLabel: PropTypes.node,
  videoSrc: PropTypes.string,
  videoTime: PropTypes.number,
  videoName: PropTypes.string,
  onExit: PropTypes.func.isRequired,
  openDocs: PropTypes.func.isRequired,
  keypointDefinitions: PropTypes.object,
  hideHeader: PropTypes.bool,
  hideHeaderText: PropTypes.bool,
  hideClone: PropTypes.bool,
  hideSettings: PropTypes.bool,
  settings: PropTypes.object,
  hideSave: PropTypes.bool,
  enabledRegionProps: PropTypes.arrayOf(PropTypes.string),
  userReducer: PropTypes.func,
  onSelectJump: PropTypes.func,
  onShowSettings: PropTypes.func
}

export default Annotator
