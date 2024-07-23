// @flow weak

import React, { useEffect, useState } from "react"
import Paper from "@mui/material/Paper"
import DefaultRegionLabel from "../RegionLabel"
import LockIcon from "@mui/icons-material/Lock"

const copyWithout = (obj, ...args) => {
  const newObj = { ...obj }
  for (const arg of args) {
    delete newObj[arg]
  }
  return newObj
}

export const RegionTags = ({
  regions,
  projectRegionBox,
  mouseEvents,
  regionClsList,
  regionTagList,
  onBeginRegionEdit,
  onChangeRegion,
  onCloseRegionEdit,
  onDeleteRegion,
  layoutParams,
  imageSrc,
  RegionEditLabel,
  onRegionClassAdded,
  enabledRegionProps,
}) => {
  const RegionLabel =
    RegionEditLabel != null ? RegionEditLabel : DefaultRegionLabel

  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])
  return regions
    .filter((r) => r.visible || r.visible === undefined)
    .map((region) => {
      const pbox = projectRegionBox(region)
      let margin = 8
      if (region.highlighted && region.type === "box") margin += 6
      const labelBoxHeight =
        region.editingLabels && !region.locked ? 220 : region.tags ? 60 : 50
      const displayOnTop = pbox.y > labelBoxHeight
      const checkBottomSpace = pbox.y + pbox.h + margin / 2 + labelBoxHeight
      const hasEnoughBottomSpace =
        checkBottomSpace < windowDimensions.height - 45
      let coords
      if (displayOnTop) {
        coords = {
          left: pbox.x,
          top: pbox.y - margin / 2,
        }
      } else if (hasEnoughBottomSpace) {
        coords = {
          left: pbox.x,
          top: pbox.y + pbox.h + margin / 2,
        }
      } else {
        // Not enough space at the bottom, render on the right
        coords = {
          left: pbox.x + pbox.w + margin / 2,
          top: pbox.y,
        }
      }
      if (region.locked) {
        return (
          <div
            key={region.id}
            data-testid={`region-${region.id}`}
            style={{
              position: "absolute",
              ...coords,
              zIndex: 10 + (region.editingLabels ? 5 : 0),
            }}
          >
            <Paper
              style={{
                position: "absolute",
                left: 0,
                ...(displayOnTop ? { bottom: 0 } : { top: 0 }),
                zIndex: 10,
                // backgroundColor: "#fff",
                borderRadius: 4,
                padding: 2,
                paddingBottom: 0,
                opacity: 0.5,
                pointerEvents: "none",
              }}
            >
              <LockIcon style={{ width: 16, height: 16, color: "#333" }} />
            </Paper>
          </div>
        )
      }
      if (region.minimized) {
        return null
      }
      return (
        <div
          key={region.id}
          data-testid={`region-${region.id}`}
          style={{
            position: "absolute",
            ...coords,
            zIndex: 10 + (region.editingLabels ? 5 : 0),
            width: 200,
          }}
          onMouseDown={(e) => e.preventDefault()}
          onMouseUp={(e) => e.preventDefault()}
          onMouseEnter={(e) => {
            if (region.editingLabels) {
              mouseEvents.onMouseUp(e)
              e.button = 1
              mouseEvents.onMouseUp(e)
            }
          }}
        >
          <div
            style={{
              position: "absolute",
              zIndex: 20,
              left: 0,
              ...(displayOnTop ? { bottom: 0 } : { top: 0 }),
            }}
            {...(!region.editingLabels
              ? copyWithout(mouseEvents, "onMouseDown", "onMouseUp")
              : {})}
          >
            <RegionLabel
              allowedClasses={regionClsList}
              allowedTags={regionTagList}
              onOpen={onBeginRegionEdit}
              onChange={onChangeRegion}
              onClose={onCloseRegionEdit}
              onDelete={onDeleteRegion}
              editing={region.editingLabels}
              region={region}
              regions={regions}
              imageSrc={imageSrc}
              onRegionClassAdded={onRegionClassAdded}
              enabledProperties={enabledRegionProps}
            />
          </div>
        </div>
      )
    })
}

export default RegionTags
