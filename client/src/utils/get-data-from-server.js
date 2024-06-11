import axios from 'axios'
import config from '../../config.js'
export const getImages = () => {
    
    const promise = axios.get(`${config.VITE_SERVER_URL}/imagesInfo`)

    // using .then, create a new promise which extracts the data
    const dataPromise = promise.then((response) => response.data)

    // return it
    return dataPromise
}

export const getImageFile = (api, configuration) => {
    return new Promise((resolve, reject) => {      
      axios.post(`${config.VITE_SERVER_URL}/${api}`, configuration, { responseType: 'blob' })
        .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            resolve(url);
        })
        .catch(error => {
          reject(error?.response); // Reject with error data
        });
    });
  };


export const clear_db = () => {
  return new Promise((resolve, reject) => {
    axios.post(`${config.VITE_SERVER_URL}/clearSession`)
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error?.response); // Reject with error data
      });
  })
}