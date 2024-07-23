// @flow

import React, { memo } from "react"
import SidebarBox from "../workspace/SidebarBox"

export const SidebarBoxContainer = ({
  icon,
  title,
  subTitle,
  children,
  noScroll,
  expandedByDefault = false,
}) => {
  return (
    <>
      <SidebarBox
        icon={icon}
        title={title}
        noScroll={noScroll}
        expandedByDefault={expandedByDefault}
      >
        {children}
      </SidebarBox>
    </>
  )
}

export default memo(
  SidebarBoxContainer,
  (prev, next) => prev.title === next.title && prev.children === next.children,
)
