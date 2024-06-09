import Annotator from "../Annotator"
import React, { useEffect, useState } from "react"
import SetupPage from "../SetupPage";
import { useSettings } from "../SettingsProvider";
import {setIn} from "seamless-immutable"

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
  const [showLabel, setShowLabel] = useState(false)
  const [imageNames, setImageNames] = useState([])
  const settingsConfig = useSettings()
  const [settings, setSettings] =  useState({
    taskDescription: "",
    taskChoice: "image_classification",
    images: [],
    dataTask: null,
    configuration: {
      labels: [],
      multipleRegions: true,
      multipleRegionLabels: true,
    }
  })

  
  const [loading, setLoading] = useState(true); // Add loading state
  const onSelectJumpHandle = (selectedImageName) => {

    let selectedImage = imageNames.filter( (image) =>{
      return image.name == selectedImageName
    })[0]

    let selectedImageIndex = imageNames.indexOf(selectedImage)
    if(selectedImageIndex != -1){
    changeSelectedImageIndex(selectedImageIndex)
    }
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
      setImageNames(payload)
    }
  };

  
  const getToolSelectionType = (toolName) => {
    const regions = [ {name: "Polygon", value: "create-polygon"}, {name: "Bounding Box", value: "create-box"}, {name: "Point", value: "create-point"}] 
    return regions.filter(region => region.name === toolName)[0]?.value || "create-polygon"
  }
  const preloadConfiguration = () => {
     // get last saved configuration
     const savedConfiguration = settingsConfig.settings|| {};
     if (savedConfiguration.configuration && savedConfiguration.configuration.labels.length > 0) {
       setSettings(savedConfiguration);
       setShowLabel(true)
     }
  }

  useEffect(() => {
    preloadConfiguration()
    setLoading(false);
  }, []);

  return (
    <>
    { !showLabel ? ( // Render loading indicator if loading is true
        <SetupPage setConfiguration={setConfiguration} settings={settings} setShowLabel={setShowLabel}/>
      ) : (
    <Annotator
      taskDescription={settings.taskDescription || "Annotate each image according to this _markdown_ specification."}
      images={settings.images || []}
      enabledTools={getEnabledTools(settings.configuration.regionTypesAllowed) || []}
      regionClsList={settings.configuration.labels.map(label => label.id) || []}
      selectedImage={selectedImageIndex}
      enabledRegionProps= {["class", "comment"]}
      userReducer= {userReducer}
      onExit={(output) => {
        console.log("Exiting!")
      }}
      settings={settings}
      onSelectJump={onSelectJumpHandle}
      showTags={true}
      selectedTool= {getToolSelectionType(settings.configuration.regions)}
      onNextImage={() => {
        const updatedIndex = (selectedImageIndex + 1) % imageNames.length
        changeSelectedImageIndex(isNaN(updatedIndex ) ? 0 : updatedIndex)
      }}
      onPrevImage={() => {
        const updatedIndex = (selectedImageIndex - 1 + imageNames.length) % imageNames.length
        changeSelectedImageIndex(isNaN(updatedIndex ) ? 0 : updatedIndex)
      }}
      openDocs={() => window.open("https://annotate-docs.dwaste.live/", '_blank')}
      hideSettings={true}
      disabledNextAndPrev={settings.images.length <= 1}
      selectedImageIndex={selectedImageIndex}
    />)}
    </>

  )
}
