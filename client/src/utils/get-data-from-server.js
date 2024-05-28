import axios from 'axios'

export const getImages = () => {
    

    const promise = axios.get('http://127.0.0.1:5000/imagesInfo')

    // using .then, create a new promise which extracts the data
    const dataPromise = promise.then((response) => response.data)

    // return it
    return dataPromise
}