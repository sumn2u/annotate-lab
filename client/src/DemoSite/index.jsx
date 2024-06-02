import Annotator from "../Annotator"
import React, { useEffect, useState } from "react"
import {saveData, splitRegionData, getImageData} from '../utils/send-data-to-server'
import { getImages } from "../utils/get-data-from-server";
import SetupPage from "../SetupPage";
import { useSnackbar } from '../SnackbarContext';


const userReducer = (state, action) => {
  switch (action.type) {
  //   case "SELECT_CLASSIFICATION": {
  //     switch (action.cls) {
  //       case "One": {
  //         return setIn(state, ["selectedTool"], "create-box");
  //       }
  //       case "Two": {
  //         return setIn(state, ["selectedTool"], "create-polygon");
  //       }
  //     }
  //   }
  }

  return state;
};



export default () => {
  const { showSnackbar } = useSnackbar();
  const [selectedImageIndex, changeSelectedImageIndex] = useState(0)
  const [showLabel, setShowLabel] = useState(false)
  const [imageNames, setImageNames] = useState([])
  const [settings, setSettings] =  useState({
    taskDescription: "",
    taskChoice: "image_classification",
    images: [],
    dataTask: null,
    configuration: {
      multiple: false,
      labels: [],
      multipleRegions: false,
      multipleRegionLabels: false,
    }
  })

  const preprocessDataBeforeSend = (output) => {
    const selectedImageIndex  = output.selectedImage;
    let _image = output.images[selectedImageIndex]
    let regions = _image['regions'] || []
    let imageData = getImageData(_image)
  
    imageData['regions'] = [] 
    for (let regionNum = 0; regionNum < regions.length; regionNum++){
      imageData['regions'].push(splitRegionData(regions[regionNum]))
    }
    saveData(imageData).then(response => {
      showSnackbar(response.message, 'success');
    })
    .catch(error => {
      showSnackbar(error.message, 'error');
    });
    }
  
  const [loading, setLoading] = useState(true); // Add loading state
  const onSelectJumpHandle = (selectedImageName) => {

    let selectedImage = imageNames.filter( (image) =>{
      return image.name == selectedImageName
    })[0]

    let selectedImageIndex = imageNames.indexOf(selectedImage)
    changeSelectedImageIndex(selectedImageIndex)
  }
  
  const getEnabledTools = (selectedTools) => {
    const enabledTools = [
      {name: "bounding-box", value: "create-box"}, 
      {name: "polygon", value: "create-polygon"}, 
      {name: "point", value: "create-point"},
      {name: "circle", value: "create-circle"}]
      
    return enabledTools.filter(tool => selectedTools.includes(tool.name)).map(tool => tool.value) || []
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
     const savedConfiguration = JSON.parse(window.localStorage.__REACT_WORKSPACE_CONFIGURATION || "{}");
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
      enabledRegionProps= {["name", "class"]}
      userReducer= {userReducer}
      onExit={(output) => {
        preprocessDataBeforeSend(output)
      }}
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
      hideSettings={true}
      selectedImageIndex={selectedImageIndex}
    />)}
    </>

  )
}
