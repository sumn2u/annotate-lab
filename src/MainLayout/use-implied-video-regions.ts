// @flow

import { useMemo } from "react";
import getImpliedVideoRegions from "../Annotator/reducers/get-implied-video-regions";
import { MainLayoutState } from "./types";
import { Region } from "../ImageCanvas/region-tools.tsx";

const emptyArr: Region[] = [];

export default (state: MainLayoutState): Region[] => {
  if (state.annotationType !== "video") return emptyArr;
  const { keyframes, currentVideoTime = 0 } = state;
  // TODO memoize
  return useMemo(
    () => getImpliedVideoRegions(keyframes, currentVideoTime),
    [keyframes, currentVideoTime]
  );
};
