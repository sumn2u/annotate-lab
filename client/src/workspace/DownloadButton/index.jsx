import React, { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import DownloadIcon from "@mui/icons-material/Download";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import colors from "../../colors.js";
import { getImageFile } from "../../utils/get-data-from-server.js";
import { useSnackbar} from "../../SnackbarContext/index.jsx"
import { hexToRgbTuple } from "../../utils/color-utils.js";
import HeaderButton from "../HeaderButton/index.jsx";
import { useTranslation } from "react-i18next"

const DownloadButton = ({selectedImageName, classList, hideHeaderText}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { showSnackbar } = useSnackbar();
  const {t} = useTranslation();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  

  const classColorMap = classList.reduce((acc, className, index) => {
    acc[className] = hexToRgbTuple(colors[index]);
    return acc;
  }, {});

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = (format) => {
    const config_data = {}
    config_data['image_name'] = selectedImageName
    config_data['colorMap'] = classColorMap
    let url = ""
    switch (format) {
        case "configuration":
            url = "download_configuration"
            break;
        case "masked-image":
            url = "download_image_mask"
            break;
        case "annotated-image":
            url = "download_image_with_annotations"
            break;
        default:
            url = "imagesName"
        }
        const withoutExtension = selectedImageName.slice(0, selectedImageName.lastIndexOf('.'));
        getImageFile(url, config_data)
            .then(response => {
                 // Create a link element and click it to trigger the download
                const link = document.createElement('a');
                link.href = response;
                if (format === "configuration") {
                    link.setAttribute('download', `config_${withoutExtension}.json`); 
                } else {
                    link.setAttribute('download', `${withoutExtension}_${format}.png`);
                }
                document.body.appendChild(link);
                link.click();

                // Cleanup
                window.URL.revokeObjectURL(url);
                handleClose();
            })
            .catch(error => {
                console.log(error, "error");
                showSnackbar(t("error.downloading_file"), 'error');
            });
  };

  return (
    <>
      <HeaderButton
       key={"download-button"}
       hideText={hideHeaderText}
       name={"Download"}
       label={t("btn.download")}
       onClick={handleClick}
       icon={<DownloadIcon />}
     />
      <Menu
        id="download-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => handleDownload("configuration")}
          sx={{ fontSize: "0.775rem", padding: "4px 8px" }}
        >
          <DescriptionIcon style={{ marginRight: 8, fontSize: "1.05rem" }} />
          {t("download.configuration")}
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
  );
};

export default DownloadButton;
