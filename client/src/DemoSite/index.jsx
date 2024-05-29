import {examples} from "./Examples.jsx"
import Annotator from "../Annotator"
import React, { useEffect, useState } from "react"
import {saveData, splitRegionData, getImageData} from '../utils/send-data-to-server'
import { getImages } from "../utils/get-data-from-server";
import {setIn} from 'seamless-immutable';


const userReducer = (state, action) => {
  switch (action.type) {
    case "SELECT_CLASSIFICATION": {
      switch (action.cls) {
        case "Car": {
          return setIn(state, ["selectedTool"], "create-box");
        }
        case "Bicycle": {
          return setIn(state, ["selectedTool"], "create-polygon");
        }
      }
    }
  }

  return state;
};

const preprocessDataBeforeSend = (output) => {
  const selectedImageIndex  = output.selectedImage;
  let _image = output.images[selectedImageIndex]
  let regions = _image['regions'] || []
  let imageData = getImageData(_image)

  imageData['regions'] = [] 
  for (let regionNum = 0; regionNum < regions.length; regionNum++){
    imageData['regions'].push(splitRegionData(regions[regionNum]))
  }

  saveData(imageData)
  }


export default () => {

  const [selectedImageIndex, changeSelectedImageIndex] = useState(0)
  const labels = ["Car", "Bicycle"]
  const enabledTools = ["create-point", "create-box", "create-polygon", "create-line", "create-expanding-line"]
  const [imageNames, setImageNames] = useState([])

  const [loading, setLoading] = useState(true); // Add loading state
  const onSelectJumpHandle = (selectedImageName) => {

    let selectedImage = imageNames.filter( (image) =>{
      return image.name == selectedImageName
    })[0]

    let selectedImageIndex = imageNames.indexOf(selectedImage)
    changeSelectedImageIndex(selectedImageIndex)
  }

  useEffect(() => {
    const fetchImageNames = async () => {
      try {
        let response = await getImages();
        const extractedNames = response.imagesNames.map(image => {
          const src = `images/${image['image-name']}`;
          const selectedClsList = (image['cls']  || '').split(';');
          const comment = image['comment'] || " ";
          const processed = image['processed'] || false;
          const name = image['image-name'].split('.')[0]; // Remove file extension from image name
          return { src, name, selectedClsList,  comment, processed};
        });

        setImageNames(extractedNames);
        setLoading(false); // Set loading to false when data is fetched
      } catch (error) {
        console.error('Failed to fetch image names:', error);
      }
    };
    fetchImageNames();
  }, []);

  

  return (
    <div>
    {loading ? ( // Render loading indicator if loading is true
        <div>Loading...</div>
      ) : (
    <Annotator
      taskDescription="Classify Waste Materials."
      images={imageNames}
      enabledTools={enabledTools}
      regionClsList={labels}
      selectedImage={selectedImageIndex}
      enabledRegionProps= {["name", "class"]}
      userReducer= {userReducer}
      onExit={(output) => {
        preprocessDataBeforeSend(output)
      }}
      preselectCls="Line-Crossing"
      onSelectJump={onSelectJumpHandle}
      showTags={true}
      onNextImage={() => {
        changeSelectedImageIndex((selectedImageIndex + 1) % imageNames.length)
        console.log(selectedImageIndex, 'selectedImageIndex')
      }}
      onPrevImage={() => {
        changeSelectedImageIndex((selectedImageIndex - 1 + imageNames.length) % imageNames.length)
      }}
      selectedImageIndex={selectedImageIndex}
      
    />)}
    </div>

  )
}
