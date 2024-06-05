import React, { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import DownloadIcon from "@mui/icons-material/Download";
import colors from "../../colors.js";
import { getImageFile } from "../../utils/get-data-from-server.js";
import { useSnackbar} from "../../SnackbarContext/index.jsx"
import { hexToRgbTuple } from "../../utils/color-utils.js";
import HeaderButton from "../HeaderButton/index.jsx";

const DownloadButton = ({selectedImageName, classList, hideHeaderText}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { showSnackbar } = useSnackbar();

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
                showSnackbar("Error downloading the file", 'error');
            });
  };

  return (
    <>
      <HeaderButton
       key={"download-button"}
       hideText={hideHeaderText}
       name={"Download"}
       onClick={handleClick}
       icon={<DownloadIcon />}
     />
      <Menu
        id="download-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleDownload("configuration")}>Configuration</MenuItem>
        <MenuItem onClick={() => handleDownload("masked-image")}>Masked Image</MenuItem>
        <MenuItem onClick={() => handleDownload("annotated-image")}> Annotated Image</MenuItem>
      </Menu>
    </>
  );
};

export default DownloadButton;
