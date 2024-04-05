import Immutable from "seamless-immutable"
import { Image, MainLayoutState } from "../../MainLayout/types"
import type { Region } from "../../ImageCanvas/region-tools"

export default (state: MainLayoutState) => {
  let currentImageIndex: string | null = null,
    pathToActiveImage: string[],
    activeImage: Image | {
      time: number,
      regions: Array<Region>,
    } | null = null
  if (state.annotationType === "image") {
    currentImageIndex = state.selectedImage
    if (+currentImageIndex === -1) {
      currentImageIndex = null
      activeImage = null
    } else {
      pathToActiveImage = ["images", currentImageIndex]
      activeImage = Immutable(state).getIn(pathToActiveImage)
    }
  } else if (state.annotationType === "video") {
    pathToActiveImage = ["keyframes", `${state.currentVideoTime || 0}`]
    activeImage = Immutable(state).getIn(pathToActiveImage) || null
  }
  return { currentImageIndex, pathToActiveImage, activeImage }
}
