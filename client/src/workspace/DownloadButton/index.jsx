import React, { useState } from "react"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import DownloadIcon from "@mui/icons-material/Download"
import DescriptionIcon from "@mui/icons-material/Description"
import ImageIcon from "@mui/icons-material/Image"
import LabelIcon from "@mui/icons-material/Label"
import ImageSearchIcon from "@mui/icons-material/ImageSearch"
import colors from "../../colors.js"
import { getImageFile } from "../../utils/get-data-from-server.js"
import { useSnackbar } from "../../SnackbarContext/index.jsx"
import { hexToRgbTuple } from "../../utils/color-utils.js"
import HeaderButton from "../HeaderButton/index.jsx"
import { useTranslation } from "react-i18next"
import config from "../../config.js"
import { useTheme } from '../../ThemeContext'

const DownloadButton = ({
  selectedImageName,
  classList,
  hideHeaderText,
  disabled,
  selectedImages,
}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const getImageNames = () => {
    return selectedImages.map((image) =>
      decodeURIComponent(image.src.split("/").pop()),
    )
  }
  const { showSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const classColorMap = classList.reduce((acc, className, index) => {
    acc[className] = hexToRgbTuple(colors[index])
    return acc
  }, {})

  const handleClose = () => {
    setAnchorEl(null)
  }

const handleDownload = (format) => {
  const isMultiple = selectedImages.length > 1;
  const imageNames = getImageNames();            // array of filenames (e.g., ["cat.jpg", "dog.jpg"])
  const firstImageName = imageNames[0] || "";    // for single-image case
  const withoutExtension = firstImageName.slice(0, firstImageName.lastIndexOf("."));

  const config_data = {
    image_name: selectedImageName,
    image_names: imageNames,
    colorMap: classColorMap,
    outlineThickness: config.OUTLINE_THICKNESS_CONFIG,
  };

  let url = "";
  switch (format) {
    case "configuration":
      url = "download_configuration";
      break;
    case "masked-image":
      url = "download_image_mask";
      break;
    case "annotated-image":
      url = "download_image_with_annotations";
      break;
    case "yolo-annotations":
      url = "download_yolo_annotations";
      break;
    case "coco-annotations":
      url = "download_coco_annotations";
      break;
    default:
      url = "imagesName";
  }

  getImageFile(url, config_data)
    .then((response) => {
      const link = document.createElement("a");
      link.href = response;

      // Determine filename based on format and whether multiple images are selected
      let fileName = "";
      switch (format) {
        case "configuration":
          fileName = "configuration.json";
          break;
        case "yolo-annotations":
          fileName = isMultiple ? "yolo_annotations.zip" : `${withoutExtension}.txt`;
          break;
        case "coco-annotations":
          fileName = "coco_annotations.json";
          break;
        case "masked-image":
          fileName = isMultiple ? "image_masks.zip" : `${withoutExtension}_mask.png`;
          break;
        case "annotated-image":
          fileName = isMultiple ? "images_with_annotations.zip" : `${withoutExtension}_annotated.png`;
          break;
        default:
          fileName = isMultiple ? "images.zip" : `${withoutExtension}_${format}.png`;
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(response);
      handleClose();
    })
    .catch((error) => {
      console.log(error, "error");
      showSnackbar(t("error.downloading_file"), "error");
    });
};
  const { theme } = useTheme();
  return (
    <>
      <HeaderButton
        key={"download-button"}
        hideText={hideHeaderText}
        name={"Download"}
        label={t("btn.download")}
        onClick={handleClick}
        disabled={disabled}
        icon={<DownloadIcon />}
      />
      <Menu
        id="download-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{ mt: "1px", "& .MuiMenu-paper":  theme === "dark" ? { backgroundColor: "#333", color: "#fff" } : {}, 
      }}
      >
        <MenuItem
          onClick={() => handleDownload("configuration")}
          sx={{ fontSize: "0.775rem", padding: "4px 8px" }}
        >
          <DescriptionIcon style={{ marginRight: 8, fontSize: "1.05rem" }} />
          {t("download.configuration")}
        </MenuItem>

        <MenuItem
          onClick={() => handleDownload("yolo-annotations")}
          sx={{ fontSize: "0.775rem", padding: "4px 8px" }}
        >
          <LabelIcon style={{ marginRight: 8, fontSize: "1.05rem" }} />
          {t("yolo_annotations")}
        </MenuItem>
        <MenuItem
          onClick={() => handleDownload("coco-annotations")}
          sx={{ fontSize: "0.775rem", padding: "4px 8px" }}
        >
          <LabelIcon style={{ marginRight: 8, fontSize: "1.05rem" }} />
          {t("coco_annotations")}
        </MenuItem>
        <MenuItem
          onClick={() => handleDownload("masked-image")}
          sx={{ fontSize: "0.775rem", padding: "4px 8px" }}
        >
          <ImageIcon style={{ marginRight: 8, fontSize: "1.05rem" }} />
          {t("download.image_mask")}
        </MenuItem>
        <MenuItem
          onClick={() => handleDownload("annotated-image")}
          sx={{ fontSize: "0.775rem", padding: "4px 8px" }}
        >
          <ImageSearchIcon style={{ marginRight: 8, fontSize: "1.05rem" }} />
          {t("download.image_with_annotations")}
        </MenuItem>
      </Menu>
    </>
  )
}

export default DownloadButton
