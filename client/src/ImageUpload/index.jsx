import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useSnackbar } from '../SnackbarContext';

const ImageUpload = ({ onImageUpload }) => {
  const { showSnackbar } = useSnackbar();
  const [images, setImages] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    if (images.length + acceptedFiles.length > 2) {
      showSnackbar("You can only upload up to 2 images", "error");
      return;
    }

    const newImages = acceptedFiles.map((file) => {
      return Object.assign(file, {
        preview: URL.createObjectURL(file),
        imageName: file.name,
      });
    });
    uploadImages(newImages);
    
  }, [images, onImageUpload]);

  const uploadImages = async (images) => {
    const formData = new FormData();

    images.forEach((image) => {
      formData.append('file', image);
    });

    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      showSnackbar(response.data.message, 'success');
      
      const uploadedFiles = response.data.files;
      const uploadedImages = uploadedFiles.map(file => ({
        preview: file.url,
        filename: file.filename,
      }));
      setImages(uploadedImages);
      onImageUpload(uploadedImages);
    } catch (error) {
      if(error?.data){
        showSnackbar(error.data.message, 'error');
      }else {
        showSnackbar("Couldn't connect server", 'error')
      }
      console.error('Error uploading images:', error);
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
    multiple: true,
    maxFiles: 2,
  });

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #ccc',
          padding: '1rem',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '1rem',
          height: '250px', // Increase height
          width: '400px',  // Increase width
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          borderRadius: '4px',
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography>Drop the files here...</Typography>
        ) : (
          <Typography>Drag 'n' drop some files here, or click to select files (up to 2)</Typography>
        )}
      </Box>
      <Box display="flex" flexWrap="wrap" gap="1rem">
        {images.map((image, index) => (
          <Box
            key={index}
            position="relative"
            display="inline-flex"
            flexDirection="column"
            alignItems="center"
          >
            <img
              src={image.preview}
              alt="preview"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '4px',
                marginBottom: '0.5rem',
              }}
            />
            <IconButton
              size="small"
              onClick={() => handleRemoveImage(index)}
              sx={{ position: 'absolute', top: '0', right: '0' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ImageUpload;
