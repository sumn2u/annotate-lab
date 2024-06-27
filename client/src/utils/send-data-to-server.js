import axios from 'axios'
import config from '../config.js'

export const getImageData = (activeImage) => {
  let imageData = {}
  imageData['src'] = decodeURIComponent(activeImage.src)
  imageData['name'] = decodeURIComponent(activeImage.name)
  imageData['cls'] = activeImage.selectedClsList || []
  imageData['comment'] = activeImage.comment || ""

  if (activeImage.pixelSize !== undefined)
    imageData['pixelSize'] = {'h': activeImage.pixelSize.h, 'w': activeImage.pixelSize.w}

  return imageData
}

export const saveData = (imageData) => {
  return new Promise((resolve, reject) => {
    axios.post(`${config.SERVER_URL}/save`, imageData)
      .then(response => {
        resolve(response.data); // Resolve with response data
      })
      .catch(error => {
        reject(error.response.data); // Reject with error data
      });
  });
};

export const saveActiveImage = (activeImage) => {
  if (activeImage === null)
    return

  let regions = activeImage['regions'] || []
  let imageData = getImageData(activeImage)

  imageData['regions'] = [] 
  for (let regionNum = 0; regionNum < regions.length; regionNum++){
    imageData['regions'].push(splitRegionData(regions[regionNum]))
  }

  return new Promise((resolve, reject) => {
    axios.post(`${config.SERVER_URL}/save`, imageData)
      .then(response => {
        resolve(response.data); // Resolve with response data
      })
      .catch(error => {
        reject(error.response.data); // Reject with error data
      });
  });
}

export const splitRegionData = (region) => {
    let regionData = {}
    regionData['cls'] = region.cls
    regionData['comment'] = region.comment
    regionData['tags'] = region.tags
    regionData['id'] = region.id
    if(region.type === "polygon"){
      regionData['type'] = "polygon"
      regionData['points'] = region.points
    }else if(region.type === "box"){
      regionData['type'] = 'box'
      regionData['coords'] = {'h': region.h, 'w': region.w, 'x': region.x, 'y': region.y}
    }else if(region.type === "circle"){
      regionData['type'] = 'circle'
      regionData['coords'] = {'rh': region.h, 'rw': region.w, 'rx': region.x, 'ry': region.y}
    } else if(region.type === "line"){
      regionData['type'] = 'line'
      regionData['points'] = {'x1': region.x1, 'y1': region.y1, 'x2': region.x2, 'y2': region.y2}
    }else{
      console.log('not a type')
    }

    return regionData
}