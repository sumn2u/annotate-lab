import { DefaultTheme } from "@mui/styles";
import { Styles } from "@mui/styles/withStyles";

const styles: Styles<DefaultTheme, {}> = {
  canvas: { width: "100%", height: "100%", position: "relative", zIndex: 1 },
  zoomIndicator: {
    position: "absolute",
    bottom: 16,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    color: "#fff",
    opacity: 0.5,
    fontWeight: "bolder",
    fontSize: 14,
    padding: 4,
  },
  fixedRegionLabel: {
    position: "absolute",
    zIndex: 10,
    top: 10,
    left: 10,
    opacity: 0.5,
    transition: "opacity 500ms",
    "&:hover": {
      opacity: 1,
    },
  },
};
export default styles;
