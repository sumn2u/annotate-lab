import Annotator from "../Annotator"
import React, { useEffect, useState } from "react"
import SetupPage from "../SetupPage";
import { useSettings } from "../SettingsProvider";
import {setIn} from "seamless-immutable"
import config from '../config.js';
import { useSnackbar } from '../SnackbarContext'
import { getImagesAnnotation } from "../utils/send-data-to-server"
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import AlertDialog from "../AlertDialog";
import { clear_db } from "../utils/get-data-from-server"
import colors from "../colors.js";
import {useTranslation} from "react-i18next"

const extractRelevantProps = (region) => ({
  cls: region.cls,
  comment: region.comment,
  id: region.id,
});

const userReducer = (state, action) => {
  switch (action.type) {
    case "CLOSE_REGION_EDITOR":
    case "DELETE_REGION": {
      const { images, selectedImage } = state;
      const lastRegions = state.lastRegions || [];
      if (selectedImage != null  && lastRegions) {
        const currentImage = images[selectedImage];
        const regions = currentImage ? (currentImage.regions || []) : [];
        if (
          regions.length !== lastRegions.length ||
          !regions.every((region, index) => {
            const lastRegion = lastRegions[index] || [];
            const currentProps = extractRelevantProps(region);
            const lastProps = extractRelevantProps(lastRegion);
            return JSON.stringify(currentProps) === JSON.stringify(lastProps);
          })
        ) {
          return setIn(state, ["hasNewChange"], true);
        } else {
          return setIn(state, ["hasNewChange"], false);
        }
      }
    }
    case "SAVE_LAST_REGIONS": {
      return setIn(state, ["lastRegions"], action.payload);
    }
    case "ENABLE_DOWNLOAD": {
      return setIn(state, ["enabledDownload"], true);
    }
  }
  return state;
};

export default () => {
  const [selectedImageIndex, changeSelectedImageIndex] = useState(0)
  const [open, setOpen] = useState(false);
  const {t} = useTranslation();
  const [showLabel, setShowLabel] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [imageNames, setImageNames] = useState([])
  const settingsConfig = useSettings()
  const [isLoading, setIsLoading] = useState(true)
  const { showSnackbar } = useSnackbar();
  const [settings, setSettings] =  useState({
    taskDescription: "",
    taskChoice: "image_classification",
    images: [],
    showLab: false,
    lastSavedImageIndex: null,
    configuration: {
      labels: [],
      multipleRegions: true,
      multipleRegionLabels: true,
    }
  })

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleExit = () => {
    logout()
    handleClose()
  }

  const [loading, setLoading] = useState(true); // Add loading state
  const onSelectJumpHandle = (selectedImageName) => {

    let selectedImage = imageNames.filter( (image) =>{
      return image.name == selectedImageName
    })[0]

    let selectedImageIndex = imageNames.indexOf(selectedImage)
    if(selectedImageIndex != -1){
      changeSelectedImageIndex(selectedImageIndex)
    }
    const newSettings = {
      ...settings,
      lastSavedImageIndex: selectedImageIndex,
    };
    settingsConfig.changeSetting('settings',newSettings);

  }
  
  const getEnabledTools = (selectedTools) => {
    const enabledTools = [
      {name: "bounding-box", value: "create-box"}, 
      {name: "polygon", value: "create-polygon"}, 
      {name: "point", value: "create-point"},
      {name: "circle", value: "create-circle"}]
      
    return enabledTools.filter(tool => selectedTools?.includes(tool.name)).map(tool => tool.value) || []
  }
  const setConfiguration = (settingsPayload) => {
    const { type, payload } = settingsPayload;

   if (type === 'UPDATE_CONFIGURATION') {
      setSettings(prevSettings => {
        return {
          ...prevSettings,
          configuration: payload
        };
      });
    }else if(type === 'UPDATE_TASK_INFO'){
      setSettings(prevSettings => {
        return {
          ...prevSettings,
          taskDescription: payload.taskDescription,
          taskChoice: payload.taskChoice,
        };
      });
    }else if (type === 'UPDATE_IMAGES'){
      setSettings(prevSettings => {
        return {
          ...prevSettings,
          images: payload
        };
      });
      changeSelectedImageIndex(0)
      setImageNames(payload)
    }
  };

  const mapRegionsColor = (regions) => {
    if(regions === undefined) return []
    return regions.map((region, index) => {
      const classLabels = settingsConfig.settings.configuration.labels;
      const clsIndex = classLabels.findIndex(label => label.id === region.cls);
      const regionColor = clsIndex < classLabels.length ? colors[clsIndex]: colors[clsIndex %  colors.length]
      return {
        ...region,
        color: regionColor
      }
    });
  }
  const fetchImages = async (imageUrls, lastOpenedImage) => {
    try {
      const fetchPromises = imageUrls.map(url =>
        fetch(url.src).then(response => response.blob())
          .then(blob => ({ ...url, src: URL.createObjectURL(blob) }))
      );
      const images = await Promise.all(fetchPromises);
      const imageURLSrcs = imageUrls.map(url => decodeURIComponent(url.src.split('/').pop()));
      let image_annotations = await getImagesAnnotation({image_names: imageURLSrcs});
      const imageMap = imageUrls.map((url, index) => {
        const imageName = decodeURIComponent(url.src.split('/').pop());
        const annotation = image_annotations.find(annotation => annotation.image_name === imageName)
        const newRegions =  mapRegionsColor(annotation?.regions) || []
        return {
            ...images[index],
            src: url.src,
            regions: newRegions,
        };
      });
  
      setSettings(prevSettings => ({
        ...prevSettings,
        images: imageMap,
        imagesBlob: images
      }));
      changeSelectedImageIndex(lastOpenedImage)
      setImageNames(imageMap);
      setIsLoading(false)
    } catch (error) {
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }
  
  const getToolSelectionType = (toolName) => {
    const regions = [ {name: "Polygon", value: "create-polygon"}, {name: "Bounding Box", value: "create-box"}, {name: "Point", value: "create-point"}] 
    return regions.filter(region => region.name === toolName)[0]?.value || "create-polygon"
  }

  const reloadApp = () => {
    settingsConfig.changeSetting('settings', null);
    window.location.reload();
  }
  
  const logout = async () => {
    try {
      const response = await clear_db();
      showSnackbar(response.message, 'success');
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 500 milliseconds
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
    reloadApp()
  };

  const preloadConfiguration = () => {
     // get last saved configuration
     const savedConfiguration = settingsConfig.settings|| {};
     const lastSavedImageIndex = savedConfiguration.lastSavedImageIndex || 0;
     if (savedConfiguration.configuration && savedConfiguration.configuration.labels.length > 0) {
       setSettings(savedConfiguration);
       if (savedConfiguration.images.length > 0) {
          fetchImages(savedConfiguration.images, lastSavedImageIndex);
        }
     }
     const showLab = settingsConfig.settings?.showLab || false;
     if(!isSettingsOpen && showLab) {
      setShowLabel(showLab)
     } 
  }
  
  const showAnnotationLab = (newSettings) => {
    setSettings(newSettings);
    const lastSavedImageIndex = newSettings.lastSavedImageIndex || 0;
    if (newSettings.images.length > 0) {
        fetchImages(newSettings.images, lastSavedImageIndex);
      }
  }
  useEffect(() => {
    preloadConfiguration();
  }, [ ]);


  return (
    <>
      {!showLabel ? (
        <SetupPage
          setConfiguration={setConfiguration}
          settings={settings}
          setShowLabel={setShowLabel}
          showAnnotationLab={showAnnotationLab}
        />
      ) : (
        <>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
              <CircularProgress />
            </Box>
          ) : (
            <> 
              <AlertDialog
                open={open}
                handleClose={handleClose}
                title={t("exit_alert_title")}
                description={t("exit_alert_description")}
                exitConfirm={t("exit_alert_confirm")}
                exitCancel={t("exit_alert_cancel")}
                handleExit= {handleExit}
              />
              <Annotator
                taskDescription={settings.taskDescription || "Annotate each image according to this _markdown_ specification."}
                images={settings.images || []}
                enabledTools={getEnabledTools(settings.configuration.regionTypesAllowed) || []}
                regionClsList={settings.configuration.labels.map(label => label.id) || []}
                selectedImage={selectedImageIndex}
                enabledRegionProps={["class", "comment"]}
                userReducer={userReducer}
                onExit={(output) => {
                  handleClickOpen()
                }}
                settings={settings}
                onSelectJump={onSelectJumpHandle}
                showTags={true}
                selectedTool={getToolSelectionType(settings.configuration.regions)}
                openDocs={() => window.open(config.DOCS_URL, '_blank')}
                hideSettings={false}
                onShowSettings={() => {
                  setIsSettingsOpen(!isSettingsOpen);
                  setShowLabel(false);
                }}
                selectedImageIndex={selectedImageIndex}
              />
            </>
          )}
        </>
      )}
    </>
  );
};