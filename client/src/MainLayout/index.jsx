// @flow

import React, { useCallback, useRef } from "react"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import ClassSelectionMenu from "../ClassSelectionMenu"
import DebugBox from "../DebugSidebarBox"
import HistorySidebarBox from "../HistorySidebarBox"
import FilesListMenu from "../FilesListMenu"
import ImageCanvas from "../ImageCanvas"
import KeyframeTimeline from "../KeyframeTimeline"
import KeyframesSelector from "../KeyframesSelectorSidebarBox"
import RegionSelector from "../RegionSelectorSidebarBox"
import TagsSidebarBox from "../TagsSidebarBox"
import Workspace from "../workspace/Workspace"
import getActiveImage from "../Annotator/reducers/get-active-image"
import iconDictionary from "./icon-dictionary"
import styles from "./styles"
import { useDispatchHotkeyHandlers } from "../ShortcutsManager"
import useEventCallback from "use-event-callback"
import useImpliedVideoRegions from "./use-implied-video-regions"
import getHotkeyHelpText from "../utils/get-hotkey-help-text"
import { useKey } from "react-use"
import { useSettings } from "../SettingsProvider"
import { withHotKeys } from "react-hotkeys"
import { Save, ExitToApp } from "@mui/icons-material"
import capitalize from "lodash/capitalize"
import { useTranslation } from "react-i18next"
import { useSnackbar } from "../SnackbarContext"
import ClassDistributionSidebarBox from "../ClassDistributionSidebarBox"
import config from "../config"

const emptyArr = []
const theme = createTheme()

const HotkeyDiv = withHotKeys(({ hotKeys, children, divRef, ...props }) => (
  <div {...{ ...hotKeys, ...props }} ref={divRef}>
    {children}
  </div>
))

export const MainLayout = ({
  state,
  dispatch,
  RegionEditLabel,
  onRegionClassAdded,
  hideHeader,
  hideHeaderText,
  onExit,
  hideClone = true,
  hideSettings = false,
  hideSave = false,
  onSelectJump,
  saveActiveImage,
  enabledRegionProps,
}) => {
  const settings = useSettings()
  const { showSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const memoizedActionFns = useRef({})
  const action = (type, ...params) => {
    const fnKey = `${type}(${params.join(",")})`
    if (memoizedActionFns.current[fnKey])
      return memoizedActionFns.current[fnKey]

    const fn = (...args) =>
      params.length > 0
        ? dispatch({
            type,
            ...params.reduce((acc, p, i) => ((acc[p] = args[i]), acc), {}),
          })
        : dispatch({ type, ...args[0] })
    memoizedActionFns.current[fnKey] = fn
    return fn
  }

  const { currentImageIndex, activeImage } = getActiveImage(state)
  let nextImage
  if (currentImageIndex !== null) {
    nextImage = state.images[currentImageIndex + 1]
  }

  useKey("Escape", () => dispatch({ type: "CANCEL" }))

  const innerContainerRef = useRef()
  const hotkeyHandlers = useDispatchHotkeyHandlers({ dispatch })

  let impliedVideoRegions = useImpliedVideoRegions(state)

  const refocusOnMouseEvent = useCallback((e) => {
    if (!innerContainerRef.current) return
    if (innerContainerRef.current.contains(document.activeElement)) return
    if (innerContainerRef.current.contains(e.target)) {
      innerContainerRef.current.focus()
      e.target.focus()
    }
  }, [])

  const canvas = (
    <ImageCanvas
      {...settings}
      showCrosshairs={
        settings.showCrosshairs &&
        !["select", "pan", "zoom"].includes(state.selectedTool)
      }
      key={state.selectedImage}
      autoSegmentationOptions={state.autoSegmentationOptions}
      showTags={state.showTags}
      allowedArea={state.allowedArea}
      modifyingAllowedArea={state.selectedTool === "modify-allowed-area"}
      regionClsList={state.regionClsList}
      regionTagList={state.regionTagList}
      regions={
        state.annotationType === "image"
          ? activeImage.regions || []
          : impliedVideoRegions
      }
      realSize={activeImage ? activeImage.realSize : undefined}
      videoPlaying={state.videoPlaying}
      imageSrc={state.annotationType === "image" ? activeImage?.src : null}
      videoSrc={state.annotationType === "video" ? state.videoSrc : null}
      pointDistancePrecision={state.pointDistancePrecision}
      createWithPrimary={state.selectedTool.includes("create")}
      dragWithPrimary={state.selectedTool === "pan"}
      zoomWithPrimary={state.selectedTool === "zoom"}
      showPointDistances={state.showPointDistances}
      videoTime={
        state.annotationType === "image"
          ? state.selectedImageFrameTime
          : state.currentVideoTime
      }
      keypointDefinitions={state.keypointDefinitions}
      onMouseMove={action("MOUSE_MOVE")}
      onMouseDown={action("MOUSE_DOWN")}
      onMouseUp={action("MOUSE_UP")}
      onChangeRegion={action("CHANGE_REGION", "region")}
      onBeginRegionEdit={action("OPEN_REGION_EDITOR", "region")}
      onCloseRegionEdit={action("CLOSE_REGION_EDITOR", "region")}
      onDeleteRegion={action("DELETE_REGION", "region")}
      onBeginBoxTransform={action("BEGIN_BOX_TRANSFORM", "box", "directions")}
      onBeginMoveLinePoint={action("BEGIN_MOVE_LINE_POINT", "line", "pointIdx")}
      onBeginMovePolygonPoint={action(
        "BEGIN_MOVE_POLYGON_POINT",
        "polygon",
        "pointIndex",
      )}
      onBeginMoveKeypoint={action(
        "BEGIN_MOVE_KEYPOINT",
        "region",
        "keypointId",
      )}
      onAddPolygonPoint={action(
        "ADD_POLYGON_POINT",
        "polygon",
        "point",
        "pointIndex",
      )}
      onSelectRegion={action("SELECT_REGION", "region")}
      onBeginMovePoint={action("BEGIN_MOVE_POINT", "point")}
      onImageLoaded={action("IMAGE_LOADED", "image")}
      RegionEditLabel={RegionEditLabel}
      onImageOrVideoLoaded={action("IMAGE_OR_VIDEO_LOADED", "metadata")}
      onChangeVideoTime={action("CHANGE_VIDEO_TIME", "newTime")}
      onChangeVideoPlaying={action("CHANGE_VIDEO_PLAYING", "isPlaying")}
      onRegionClassAdded={onRegionClassAdded}
      enabledRegionProps={enabledRegionProps}
    />
  )

  const onClickIconSidebarItem = useEventCallback((item) => {
    const { selectedTool } = state
    if (selectedTool.length > 0 && item.name !== null) {
      dispatch({ type: "SELECT_TOOL", selectedTool: item.name })
    }
  })

  const onClickHeaderItem = useEventCallback((item) => {
    if (item.name === "Exit") {
      onExit()
    } else {
      dispatch({ type: "HEADER_BUTTON_CLICKED", buttonName: item.name })
    }
  })
  const debugModeOn = Boolean(window.localStorage.$ANNOTATE_DEBUG_MODE && state)
  const nextImageHasRegions =
    !nextImage || (nextImage.regions && nextImage.regions.length > 0)
  const selectedImages = state.images.filter((image) => image.selected)
  const hasRegions = state.images[state.selectedImage]?.regions?.length > 0
  const disableRegion =  !(state.images.length > 0 && state.regionClsList.length > 0);   // enable save button for all cases
  // hasRegions ? false : !state.hasNewChange

  return (
    <ThemeProvider theme={theme}>
      <HotkeyDiv
        tabIndex={-1}
        divRef={innerContainerRef}
        onMouseDown={refocusOnMouseEvent}
        onMouseOver={refocusOnMouseEvent}
        allowChanges
        handlers={hotkeyHandlers}
        style={styles.container}
      >
        <Workspace
          iconDictionary={iconDictionary}
          hideHeader={hideHeader}
          hideHeaderText={hideHeaderText}
          selectedImageName={state.images[currentImageIndex]?.src
            .split("/")
            .pop()}
          classList={state.regionClsList}
          selectedImages={selectedImages}
          headerLeftSide={[
            state.annotationType === "video" ? (
              <KeyframeTimeline
                key="KeyframeTimeline"
                currentTime={state.currentVideoTime}
                duration={state.videoDuration}
                onChangeCurrentTime={action("CHANGE_VIDEO_TIME", "newTime")}
                keyframes={state.keyframes}
              />
            ) : activeImage ? (
              <div key="activeImage" style={styles.headerTitle}>
                {capitalize(activeImage.name)}
              </div>
            ) : null,
          ].filter(Boolean)}
          headerItems={[
            {
              name: "Download",
              label: t("btn.download"),
              disabled: !state.enabledDownload,
              hasInnerMenu: true,
            },
            state.annotationType !== "video"
              ? null
              : !state.videoPlaying
                ? { name: "Play", label: t("btn.play") }
                : { name: "Pause", label: t("btn.pause") },
            !hideClone &&
              state.hasNewChange &&
              !nextImageHasRegions &&
              activeImage.regions && { name: "Clone", label: t("btn.clone") },
            !hideSave && {
              name: "Save",
              label: t("btn.save"),
              disabled: disableRegion,
              icon: <Save />,
            },
            { name: "Docs", label: t("btn.docs") },
            !hideSettings && { name: "Settings", label: t("btn.settings") },
            { name: "Exit", label: t("btn.exit"), icon: <ExitToApp /> },
          ].filter(Boolean)}
          onClickHeaderItem={onClickHeaderItem}
          onClickIconSidebarItem={onClickIconSidebarItem}
          selectedTools={[
            state.selectedTool,
            state.showTags && "show-tags",
          ].filter(Boolean)}
          iconSidebarItems={[
            {
              name: "select",
              helperText:
                t("helptext_select") + getHotkeyHelpText("select_tool"),
              alwaysShowing: true,
            },
            {
              name: "pan",
              helperText: t("helptext_pan") + getHotkeyHelpText("pan_tool"),
              alwaysShowing: true,
            },
            {
              name: "zoom",
              helperText: t("helptext_zoom") + getHotkeyHelpText("zoom_tool"),
              alwaysShowing: true,
            },
            {
              name: "show-tags",
              helperText: t("helptext_tags"),
              alwaysShowing: false,
            },
            {
              name: "create-point",
              helperText: "Add Point" + getHotkeyHelpText("create_point"),
            },
            {
              name: "create-box",
              helperText:
                t("helptext_boundingbox") +
                getHotkeyHelpText("create_bounding_box"),
            },
            {
              name: "create-circle",
              helperText:
                t("helptext_circle") + getHotkeyHelpText("create_circle"),
            },
            {
              name: "create-polygon",
              helperText:
                t("helptext_polypolygon") + getHotkeyHelpText("create_polygon"),
            },
            {
              name: "create-line",
              helperText: "Add Line",
            },
            {
              name: "create-expanding-line",
              helperText: "Add Expanding Line",
            },
            {
              name: "modify-allowed-area",
              helperText: "Modify Allowed Area",
            },
          ]
            .filter(Boolean)
            .filter(
              (a) => a.alwaysShowing || state.enabledTools.includes(a.name),
            )}
          rightSidebarItems={[
            debugModeOn && (
              <DebugBox
                state={debugModeOn}
                lastAction={state.lastAction}
                key="DebugBox"
              />
            ),
            state.regionClsList && (
              <FilesListMenu
                key="FilesListMenu"
                state={state}
                selectedImage={state.selectedImage}
                allImages={state.images}
                onSelectJump={onSelectJump}
                onSelectFile={action("SELECT_FILE", "selected")}
                saveActiveImage={saveActiveImage}
                onClick={action("CHANGE_2_COMPLETE", "activeImage")}
              />
            ),
            state.regionClsList && (
              <ClassSelectionMenu
                key="ClassSelectionMenu"
                selectedCls={state.selectedCls}
                preselectCls={state.preselectCls}
                regionClsList={state.regionClsList}
                regions={activeImage ? activeImage.regions : emptyArr}
                regionColorList={state.regionColorList}
                onSelectCls={action("SELECT_CLASSIFICATION", "cls")}
              />
            ),
            state.labelImages && (
              <TagsSidebarBox
                key="TagsSidebareBox"
                currentImage={activeImage}
                imageClsList={state.imageClsList}
                imageTagList={state.imageTagList}
                onChangeImage={action("CHANGE_IMAGE", "delta")}
                expandedByDefault
              />
            ),
            // (state.images?.length || 0) > 1 && (
            //   <ImageSelector
            //     onSelect={action("SELECT_REGION", "region")}
            //     images={state.images}
            //   />
            // ),
            <RegionSelector
              key={"activeImage" + activeImage.id}
              regions={activeImage ? activeImage.regions : emptyArr}
              onSelectRegion={action("SELECT_REGION", "region")}
              onDeleteRegion={action("DELETE_REGION", "region")}
              onChangeRegion={action("CHANGE_REGION", "region")}
            />,
            state.keyframes && (
              <KeyframesSelector
                key="KeyframesSelector"
                onChangeVideoTime={action("CHANGE_VIDEO_TIME", "newTime")}
                onDeleteKeyframe={action("DELETE_KEYFRAME", "time")}
                onChangeCurrentTime={action("CHANGE_VIDEO_TIME", "newTime")}
                currentTime={state.currentVideoTime}
                duration={state.videoDuration}
                keyframes={state.keyframes}
              />
            ),
            <HistorySidebarBox
              key="HistorySideBox"
              history={state.history}
              onRestoreHistory={action("RESTORE_HISTORY")}
            />,
            config.SHOW_CLASS_DISTRIBUTION && (
            <ClassDistributionSidebarBox
              key="ClassDistributionSidebarBox"
              regionClsList={state.regionClsList}
            />),
          ].filter(Boolean)}
        >
          {canvas}
        </Workspace>
      </HotkeyDiv>
    </ThemeProvider>
  )
}

export default MainLayout
