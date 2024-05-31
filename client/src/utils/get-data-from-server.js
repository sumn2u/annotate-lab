import axios from 'axios'

export const getImages = () => {
    
    const promise = axios.get(`${import.meta.env.VITE_SERVER_URL}/imagesInfo`)

    // using .then, create a new promise which extracts the data
    const dataPromise = promise.then((response) => response.data)

    // return it
    return dataPromise
}