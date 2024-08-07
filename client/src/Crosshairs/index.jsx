// @flow

import React, { Fragment, useEffect } from "react"

export const Crosshairs = ({ mousePosition, x, y }) => {
  if (mousePosition) {
    x = mousePosition.current.x
    y = mousePosition.current.y
  }

  useEffect(() => {
    if (!mousePosition) return
    const interval = setInterval(() => {}, 10)
    return () => clearInterval(interval)
  })

  return (
    <Fragment>
      <div
        style={{
          position: "absolute",
          height: "100%",
          width: 1,
          zIndex: 10,
          backgroundColor: "#f00",
          left: x,
          pointerEvents: "none",
          top: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "100%",
          zIndex: 10,
          height: 1,
          backgroundColor: "#f00",
          top: y,
          pointerEvents: "none",
          left: 0,
        }}
      />
    </Fragment>
  )
}

export default Crosshairs
